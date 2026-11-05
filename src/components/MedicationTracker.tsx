import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Printer, 
  Send, 
  User, 
  Phone, 
  MapPin, 
  TrendingUp, 
  FileText, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Bell, 
  Maximize2, 
  X, 
  Layers, 
  Activity, 
  Edit3, 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  BookmarkCheck,
  CheckSquare,
  Home,
  Users,
  Folder,
  Video,
  Heart,
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react';

interface MedicationTrackerProps {
  user?: any;
  onNavigate?: (v: any) => void;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface MedicineItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionDraft {
  taskId: string;
  taskTitle: string;
  patientId: string;
  diagnosis: string;
  medicines: MedicineItem[];
  setReminder: boolean;
  allowRefill: boolean;
  note: string;
}

interface Patient {
  id: string;
  pid: string;
  name: string;
  age: number;
  gender: 'F' | 'M';
  phone: string;
  location: string;
  lastVisit: string;
  nextAppointment: string;
  status: 'Active' | 'Follow-up';
  avatar: string;
  adherenceRate: number;
  activePrescriptionsCount: number;
}

const DR_AKORA_AVATAR = "/src/assets/images/doctorian_admin_avatar_1793707337172.jpg";
const PATIENT_SARAH = "/src/assets/images/patient_sarah_nakato_1793707974129.jpg";
const PATIENT_JOHN = "/src/assets/images/patient_john_ochieng_1793707975950.jpg";
const PATIENT_MARY = "/src/assets/images/patient_mary_nakitende_1793707974702.jpg";

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({ user, onNavigate, addToast }) => {
  // Navigation View Selection
  const [activeTab, setActiveTab] = useState<'new_rx' | 'my_prescriptions' | 'tracker' | 'templates'>('new_rx');

  // Patients Roster
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'p-1',
      pid: 'PT-00124',
      name: 'Sarah Nakato',
      age: 28,
      gender: 'F',
      phone: '+256 772 123456',
      location: 'Kampala, Uganda',
      lastVisit: 'Today, 10:30 AM',
      nextAppointment: 'Nov 6, 2026 • 9:00 AM',
      status: 'Active',
      avatar: PATIENT_SARAH,
      adherenceRate: 92,
      activePrescriptionsCount: 5
    },
    {
      id: 'p-2',
      pid: 'PT-00123',
      name: 'John Ochieng',
      age: 45,
      gender: 'M',
      phone: '+256 782 998877',
      location: 'Entebbe, Uganda',
      lastVisit: 'Today, 09:20 AM',
      nextAppointment: 'Nov 8, 2026 • 11:30 AM',
      status: 'Active',
      avatar: PATIENT_JOHN,
      adherenceRate: 88,
      activePrescriptionsCount: 3
    },
    {
      id: 'p-3',
      pid: 'PT-00122',
      name: 'Mary Nakitende',
      age: 32,
      gender: 'F',
      phone: '+256 701 445566',
      location: 'Jinja, Uganda',
      lastVisit: 'Yesterday',
      nextAppointment: 'Nov 12, 2026 • 02:00 PM',
      status: 'Follow-up',
      avatar: PATIENT_MARY,
      adherenceRate: 95,
      activePrescriptionsCount: 2
    },
    {
      id: 'p-4',
      pid: 'PT-00121',
      name: 'David Kato',
      age: 50,
      gender: 'M',
      phone: '+256 754 112233',
      location: 'Mukono, Uganda',
      lastVisit: '2 days ago',
      nextAppointment: 'Nov 15, 2026 • 10:00 AM',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      adherenceRate: 91,
      activePrescriptionsCount: 4
    },
    {
      id: 'p-5',
      pid: 'PT-00120',
      name: 'Grace Auma',
      age: 27,
      gender: 'F',
      phone: '+256 777 665544',
      location: 'Gulu, Uganda',
      lastVisit: '2 days ago',
      nextAppointment: 'Nov 20, 2026 • 03:00 PM',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      adherenceRate: 97,
      activePrescriptionsCount: 1
    }
  ]);

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>('p-1');
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Patients Filter
  const [patientFilter, setPatientFilter] = useState<'all' | 'active' | 'followup'>('all');
  const [patientSearch, setPatientSearch] = useState('');

  // Multi-Tasking Prescription Drafts Scratchpad
  const [activeTaskId, setActiveTaskId] = useState<string>('task-1');
  const [drafts, setDrafts] = useState<PrescriptionDraft[]>([
    {
      taskId: 'task-1',
      taskTitle: 'Sarah Nakato',
      patientId: 'p-1',
      diagnosis: 'Malaria',
      medicines: [
        {
          id: 'med-1',
          medicine: 'Artemether + Lumefantrine',
          dosage: '2 Tablets',
          frequency: 'Twice Daily',
          duration: '3 Days',
          instructions: 'After Meals'
        }
      ],
      setReminder: true,
      allowRefill: true,
      note: 'Ensure full 3-day course completion even if fever subsides.'
    }
  ]);

  const currentDraft = drafts.find(d => d.taskId === activeTaskId) || drafts[0];

  // Active Prescriptions List
  const [activePrescriptions, setActivePrescriptions] = useState<Array<{
    id: string;
    medicine: string;
    dose: string;
    duration: string;
    status: 'Active' | 'Completed' | 'Pending Refill';
  }>>([
    { id: 'rx-1', medicine: 'Artemether + Lumefantrine', dose: '2 Tabs', duration: '3 Days', status: 'Active' },
    { id: 'rx-2', medicine: 'Paracetamol 500mg', dose: '1 Tab', duration: '5 Days', status: 'Active' },
    { id: 'rx-3', medicine: 'Oral Rehydration Salts', dose: '1 Sachet', duration: '3 Days', status: 'Active' },
    { id: 'rx-4', medicine: 'Multivitamin Complex', dose: '1 Capsule', duration: '30 Days', status: 'Active' },
    { id: 'rx-5', medicine: 'Zinc Sulfate 20mg', dose: '1 Tab', duration: '14 Days', status: 'Active' },
  ]);

  // Medication Doses Timeline
  const [doses, setDoses] = useState([
    { id: 'd-1', time: '8:00 AM', status: 'Taken' },
    { id: 'd-2', time: '2:00 PM', status: 'Taken' },
    { id: 'd-3', time: '8:00 PM', status: 'Pending' },
  ]);

  // Printable Rx Modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  // New Patient Modal
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 30,
    gender: 'F' as 'F' | 'M',
    phone: '+256 ',
    location: 'Kampala, Uganda'
  });

  // Top Search state
  const [topSearch, setTopSearch] = useState('');

  // Drug Interaction Warnings
  const [interactionWarning, setInteractionWarning] = useState<string | null>(null);

  // Sync draft patient changes
  const updateCurrentDraft = (updater: (prev: PrescriptionDraft) => PrescriptionDraft) => {
    setDrafts(prev => prev.map(d => d.taskId === activeTaskId ? updater(d) : d));
  };

  // Add another medicine row to current prescription
  const handleAddMedicineRow = () => {
    const newMed: MedicineItem = {
      id: `med-${Date.now()}`,
      medicine: 'Paracetamol 500mg',
      dosage: '1 Tablet',
      frequency: 'Three Times Daily',
      duration: '3 Days',
      instructions: 'After Meals'
    };
    updateCurrentDraft(draft => ({
      ...draft,
      medicines: [...draft.medicines, newMed]
    }));
    addToast?.('Additional medicine item added to prescription.', 'info');
  };

  // Remove medicine row
  const handleRemoveMedicineRow = (id: string) => {
    if (currentDraft.medicines.length <= 1) {
      addToast?.('A prescription must contain at least one medicine item.', 'error');
      return;
    }
    updateCurrentDraft(draft => ({
      ...draft,
      medicines: draft.medicines.filter(m => m.id !== id)
    }));
  };

  // Update specific medicine row
  const handleUpdateMedicine = (id: string, field: keyof MedicineItem, val: string) => {
    updateCurrentDraft(draft => ({
      ...draft,
      medicines: draft.medicines.map(m => m.id === id ? { ...m, [field]: val } : m)
    }));
  };

  // Create New Multi-Task Scratchpad Tab
  const handleCreateNewTask = () => {
    const newId = `task-${Date.now()}`;
    const newDraft: PrescriptionDraft = {
      taskId: newId,
      taskTitle: `Draft #${drafts.length + 1}`,
      patientId: selectedPatientId,
      diagnosis: 'Hypertension',
      medicines: [
        {
          id: `med-${Date.now()}`,
          medicine: 'Amlodipine 5mg',
          dosage: '1 Tablet',
          frequency: 'Once Daily',
          duration: '30 Days',
          instructions: 'Morning'
        }
      ],
      setReminder: true,
      allowRefill: true,
      note: 'Monitor blood pressure weekly.'
    };
    setDrafts(prev => [...prev, newDraft]);
    setActiveTaskId(newId);
    addToast?.('New multi-task prescription scratchpad created.', 'success');
  };

  // Close Multi-Task Tab
  const handleCloseTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (drafts.length <= 1) {
      addToast?.('Cannot close the last open prescription tab.', 'info');
      return;
    }
    const remaining = drafts.filter(d => d.taskId !== id);
    setDrafts(remaining);
    if (activeTaskId === id) {
      setActiveTaskId(remaining[0].taskId);
    }
  };

  // Apply Quick Template
  const handleApplyTemplate = (templateName: string) => {
    if (templateName === 'malaria') {
      updateCurrentDraft(draft => ({
        ...draft,
        diagnosis: 'Malaria',
        medicines: [
          {
            id: `med-m1`,
            medicine: 'Artemether + Lumefantrine',
            dosage: '2 Tablets',
            frequency: 'Twice Daily',
            duration: '3 Days',
            instructions: 'After Meals with fatty meal/milk'
          },
          {
            id: `med-m2`,
            medicine: 'Paracetamol 500mg',
            dosage: '2 Tablets',
            frequency: 'Three Times Daily',
            duration: '3 Days',
            instructions: 'For fever & body aches'
          }
        ]
      }));
      addToast?.('Applied MoH Uncomplicated Malaria Clinical Template', 'success');
    } else if (templateName === 'hypertension') {
      updateCurrentDraft(draft => ({
        ...draft,
        diagnosis: 'Hypertension',
        medicines: [
          {
            id: `med-h1`,
            medicine: 'Amlodipine 5mg',
            dosage: '1 Tablet',
            frequency: 'Once Daily',
            duration: '30 Days',
            instructions: 'In the morning'
          }
        ]
      }));
      addToast?.('Applied Essential Hypertension Protocol', 'success');
    } else if (templateName === 'respiratory') {
      updateCurrentDraft(draft => ({
        ...draft,
        diagnosis: 'Respiratory Infection',
        medicines: [
          {
            id: `med-r1`,
            medicine: 'Amoxicillin + Clavulanate 625mg',
            dosage: '1 Tablet',
            frequency: 'Twice Daily',
            duration: '7 Days',
            instructions: 'Take at start of a meal'
          }
        ]
      }));
      addToast?.('Applied Bacterial RTI Clinical Protocol', 'success');
    }
  };

  // Check for drug interactions
  useEffect(() => {
    const medNames = currentDraft.medicines.map(m => m.medicine.toLowerCase());
    if (medNames.some(m => m.includes('ciprofloxacin')) && medNames.some(m => m.includes('artemether'))) {
      setInteractionWarning('Potential QT prolongation warning between Quinolones and Artemisinin derivatives. Monitor ECG.');
    } else {
      setInteractionWarning(null);
    }
  }, [currentDraft.medicines]);

  // Save Prescription
  const handleSavePrescription = () => {
    const primaryMed = currentDraft.medicines[0];
    const newEntry = {
      id: `rx-${Date.now()}`,
      medicine: primaryMed.medicine,
      dose: primaryMed.dosage,
      duration: primaryMed.duration,
      status: 'Active' as const
    };
    setActivePrescriptions(prev => [newEntry, ...prev]);
    addToast?.(`Prescription saved to EHR record for ${selectedPatient.name}.`, 'success');
  };

  // Send to Patient
  const handleSendToPatient = () => {
    addToast?.(`Encrypted digital Rx and reminder dispatched to ${selectedPatient.phone} via GSM relay.`, 'success');
  };

  // Add New Patient
  const handleAddNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) return;
    const newP: Patient = {
      id: `p-${Date.now()}`,
      pid: `PT-00${patients.length + 125}`,
      name: newPatientForm.name,
      age: Number(newPatientForm.age),
      gender: newPatientForm.gender,
      phone: newPatientForm.phone,
      location: newPatientForm.location,
      lastVisit: 'Just Registered',
      nextAppointment: 'Not Scheduled',
      status: 'Active',
      avatar: newPatientForm.gender === 'F' ? PATIENT_MARY : PATIENT_JOHN,
      adherenceRate: 100,
      activePrescriptionsCount: 0
    };
    setPatients(prev => [newP, ...prev]);
    setSelectedPatientId(newP.id);
    setShowNewPatientModal(false);
    addToast?.(`Patient ${newP.name} successfully registered.`, 'success');
  };

  // Toggle dose taken
  const handleToggleDose = (id: string) => {
    setDoses(prev => prev.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === 'Taken' ? 'Pending' : 'Taken';
        addToast?.(`Dose at ${d.time} marked as ${nextStatus}.`, 'info');
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  // Filtered Patients
  const filteredPatients = patients.filter(p => {
    const matchesFilter = 
      patientFilter === 'all' ? true :
      patientFilter === 'active' ? p.status === 'Active' :
      p.status === 'Follow-up';
    const matchesSearch = p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
                          p.pid.toLowerCase().includes(patientSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#071026] text-slate-800 font-sans flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-blue-950/40">
      
      {/* Main Workstation Container (Header + KPI Cards + Workstation Panels) */}
      <div className="flex-1 min-w-0 bg-[#f1f5f9] p-3 sm:p-5 lg:p-6 space-y-5 overflow-y-auto">
      
        {/* ========================================================= */}
        {/* TOP HEADER BAR CONTRACT (Matching Screenshot Exactly)     */}
        {/* ========================================================= */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        
        {/* Left: Search Patients & Prescriptions */}
        <div className="relative flex-1 max-w-xl">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            value={topSearch}
            onChange={(e) => setTopSearch(e.target.value)}
            placeholder="Search patients, prescriptions...(Ctrl + K)"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Right Status, Notifications, and Dr. Joseph Akora Profile */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4 shrink-0">
          
          {/* Online Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
            <ChevronDown size={13} className="text-emerald-600" />
          </div>

          {/* Notifications with Red Badge */}
          <button 
            type="button" 
            onClick={() => addToast?.('Prescription queue: 5 pending refills ready for validation.', 'info')}
            title="Prescription Notifications"
            className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all cursor-pointer shadow-xs"
          >
            <Bell size={17} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center shadow-xs">
              5
            </span>
          </button>

          {/* Full Screen */}
          <button 
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            title="Toggle Fullscreen"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all cursor-pointer shadow-xs"
          >
            <Maximize2 size={17} />
          </button>

          {/* User Profile Card: Dr. Joseph Akora (Administrator) */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <img 
              src={DR_AKORA_AVATAR} 
              alt="Dr. Joseph Akora" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 shadow-xs"
            />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-slate-900 leading-tight">Dr. Joseph Akora</span>
                <ChevronDown size={13} className="text-slate-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 block">Administrator</span>
            </div>
          </div>

        </div>

      </header>

      {/* ========================================================= */}
      {/* TOP 4 STAT CARDS ROW WITH SPARKLINE CURVES                */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Patients */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500">Total Patients</p>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">2,487</p>
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span>↑ +12%</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <User size={24} />
            </div>
          </div>
          <div className="mt-3 h-8 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 160 30">
              <path d="M 0,25 Q 30,5 60,18 T 120,4 T 160,10" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Card 2: Active Prescriptions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500">Active Prescriptions</p>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">1,256</p>
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span>↑ +8%</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Pill size={24} />
            </div>
          </div>
          <div className="mt-3 h-8 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 160 30">
              <path d="M 0,22 Q 40,28 80,10 T 130,16 T 160,4" fill="none" stroke="#10b981" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Card 3: Today's Prescriptions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500">Today's Prescriptions</p>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">243</p>
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span>↑ +5%</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar size={24} />
            </div>
          </div>
          <div className="mt-3 h-8 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 160 30">
              <path d="M 0,24 Q 35,5 70,18 T 130,8 T 160,2" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Card 4: Medication Adherence */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500">Medication Adherence</p>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">94.6%</p>
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span>↑ +1.3%</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className="mt-3 h-8 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 160 30">
              <path d="M 0,18 Q 40,8 80,18 T 125,5 T 160,10" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* MAIN WORKSPACE 3-COLUMN LAYOUT                            */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ======================================================= */}
        {/* COLUMN 1: PATIENTS ROSTER LIST (Left Panel)             */}
        {/* ======================================================= */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3.5">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>Patients (All)</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowNewPatientModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>New Patient</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patient..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => setPatientFilter('all')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                patientFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (2,487)
            </button>
            <button
              type="button"
              onClick={() => setPatientFilter('active')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                patientFilter === 'active' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active (1,923)
            </button>
            <button
              type="button"
              onClick={() => setPatientFilter('followup')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                patientFilter === 'followup' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Follow-up (564)
            </button>
          </div>

          {/* Patients List Items */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar pr-0.5">
            {filteredPatients.map(p => {
              const isSelected = p.id === selectedPatientId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    updateCurrentDraft(draft => ({ ...draft, patientId: p.id, taskTitle: p.name }));
                    addToast?.(`Loaded profile for ${p.name}`, 'info');
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400/40 shadow-xs' 
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <img 
                    src={p.avatar} 
                    alt={p.name} 
                    className="w-11 h-11 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{p.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        p.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        ● {p.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      {p.gender}/{p.age} • PID: {p.pid}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Last visit: {p.lastVisit}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onNavigate?.('records')}
            className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-500 pt-2 block cursor-pointer"
          >
            View All Patients →
          </button>

        </div>

        {/* ======================================================= */}
        {/* COLUMN 2: PRESCRIPTION STUDIO & MULTI-TASKING HUB       */}
        {/* ======================================================= */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('new_rx')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'new_rx' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Edit3 size={14} />
                <span>New Prescription</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('my_prescriptions')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'my_prescriptions' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText size={14} />
                <span>My Prescriptions</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tracker')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'tracker' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock size={14} />
                <span>Medication Tracker</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'templates' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers size={14} />
                <span>Templates</span>
              </button>
            </div>

            {/* Multi-Task Scratchpad Adder */}
            <button
              type="button"
              onClick={handleCreateNewTask}
              title="Create another concurrent prescription draft"
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-blue-600 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>+ Task</span>
            </button>
          </div>

          {/* Multi-Tasking Scratchpad Tab Strip */}
          {drafts.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {drafts.map((d, idx) => {
                const isSelectedTask = d.taskId === activeTaskId;
                return (
                  <div
                    key={d.taskId}
                    onClick={() => setActiveTaskId(d.taskId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                      isSelectedTask 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{d.taskTitle || `Task #${idx + 1}`}</span>
                    <button 
                      type="button"
                      onClick={(e) => handleCloseTask(d.taskId, e)}
                      className="p-0.5 hover:bg-black/20 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Clinical Templates Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Fast Protocol:</span>
            <button
              type="button"
              onClick={() => handleApplyTemplate('malaria')}
              className="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-bold shrink-0 transition-all cursor-pointer"
            >
              Malaria Protocol (AL)
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('hypertension')}
              className="px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[11px] font-bold shrink-0 transition-all cursor-pointer"
            >
              Hypertension (Amlodipine)
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('respiratory')}
              className="px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-bold shrink-0 transition-all cursor-pointer"
            >
              Bacterial RTI (Augmentin)
            </button>
          </div>

          {/* Patient Information Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img 
                src={selectedPatient.avatar} 
                alt={selectedPatient.name} 
                className="w-13 h-13 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
              />
              <div>
                <h4 className="text-base font-black text-slate-900">{selectedPatient.name}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  PID: {selectedPatient.pid} • Age: {selectedPatient.age} • {selectedPatient.gender}
                </p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                  ● Active Patient
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => addToast?.(`Displaying comprehensive clinical EHR for ${selectedPatient.name}`, 'info')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>View Profile</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Rx Prescription Details Form */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="text-blue-600 font-serif font-black text-lg">Rx</span>
                <span>Prescription Details</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Prescribing Physician: <strong className="text-slate-700">Dr. Joseph Akora</strong>
              </span>
            </div>

            {/* Drug Interaction Warning Banner */}
            {interactionWarning && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2 shadow-xs">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>{interactionWarning}</span>
              </div>
            )}

            {/* Diagnosis / Condition Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Diagnosis / Condition <span className="text-rose-500">*</span>
              </label>
              <select
                value={currentDraft.diagnosis}
                onChange={(e) => updateCurrentDraft(draft => ({ ...draft, diagnosis: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Malaria">Malaria (Uncomplicated Plasmodium Falciparum)</option>
                <option value="Hypertension">Essential Hypertension (Stage 1/2)</option>
                <option value="Type 2 Diabetes">Type 2 Diabetes Mellitus</option>
                <option value="Respiratory Infection">Acute Upper/Lower Respiratory Infection</option>
                <option value="Peptic Ulcer">Peptic Ulcer Disease / Gastritis</option>
                <option value="Bacterial Enteritis">Bacterial Enteritis / Dysentery</option>
                <option value="Asthma">Bronchial Asthma Maintenance</option>
                <option value="General Pain">Acute Musculoskeletal Pain & Inflammation</option>
              </select>
            </div>

            {/* Multi-Medicine Items Stacking */}
            <div className="space-y-3 pt-1">
              {currentDraft.medicines.map((item, idx) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3 relative group">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-blue-700 uppercase tracking-wide">
                      Medication #{idx + 1}
                    </span>
                    {currentDraft.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineRow(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove medication"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Medicine Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Medicine <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={item.medicine}
                        onChange={(e) => handleUpdateMedicine(item.id, 'medicine', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="Artemether + Lumefantrine">Artemether 20mg + Lumefantrine 120mg</option>
                        <option value="Amoxicillin + Clavulanate 625mg">Amoxicillin + Clavulanate 625mg</option>
                        <option value="Metformin 500mg">Metformin Hydrochloride 500mg</option>
                        <option value="Amlodipine 5mg">Amlodipine Besylate 5mg</option>
                        <option value="Losartan 50mg">Losartan Potassium 50mg</option>
                        <option value="Omeprazole 20mg">Omeprazole Delayed-Release 20mg</option>
                        <option value="Paracetamol 500mg">Paracetamol 500mg</option>
                        <option value="Ibuprofen 400mg">Ibuprofen 400mg</option>
                        <option value="Ciprofloxacin 500mg">Ciprofloxacin 500mg</option>
                        <option value="Azithromycin 500mg">Azithromycin 500mg</option>
                        <option value="Oral Rehydration Salts">Oral Rehydration Salts (ORS) Sachets</option>
                        <option value="Zinc Sulfate 20mg">Zinc Sulfate Dispersible 20mg</option>
                      </select>
                    </div>

                    {/* Dosage */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Dosage <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={item.dosage}
                        onChange={(e) => handleUpdateMedicine(item.id, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="2 Tablets">2 Tablets</option>
                        <option value="1 Tablet">1 Tablet</option>
                        <option value="1 Capsule">1 Capsule</option>
                        <option value="2 Capsules">2 Capsules</option>
                        <option value="5ml Suspension">5ml Suspension</option>
                        <option value="10ml Suspension">10ml Suspension</option>
                        <option value="1 Sachet">1 Sachet (200ml)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Frequency */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Frequency <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={item.frequency}
                        onChange={(e) => handleUpdateMedicine(item.id, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="Twice Daily">Twice Daily (q12h)</option>
                        <option value="Once Daily">Once Daily (OD)</option>
                        <option value="Three Times Daily">Three Times Daily (TDS)</option>
                        <option value="Four Times Daily">Four Times Daily (QDS)</option>
                        <option value="Every 8 Hours">Every 8 Hours</option>
                        <option value="As Needed">As Needed (PRN)</option>
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Duration <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={item.duration}
                        onChange={(e) => handleUpdateMedicine(item.id, 'duration', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="3 Days">3 Days</option>
                        <option value="5 Days">5 Days</option>
                        <option value="7 Days">7 Days</option>
                        <option value="10 Days">10 Days</option>
                        <option value="14 Days">14 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                      </select>
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Instructions
                      </label>
                      <input 
                        type="text" 
                        value={item.instructions}
                        onChange={(e) => handleUpdateMedicine(item.id, 'instructions', e.target.value)}
                        placeholder="e.g. After Meals"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Add Another Medicine Button */}
            <button
              type="button"
              onClick={handleAddMedicineRow}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-600 hover:text-blue-700 bg-blue-50/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>+ Add Another Medicine</span>
            </button>

            {/* 3 Option / Toggle Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Set Reminder */}
              <div 
                onClick={() => updateCurrentDraft(d => ({ ...d, setReminder: !d.setReminder }))}
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  currentDraft.setReminder ? 'bg-purple-50/70 border-purple-300' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Set Reminder</p>
                  <p className="text-[10px] font-bold text-purple-700">{currentDraft.setReminder ? '✓ Enabled' : 'Disabled'}</p>
                </div>
              </div>

              {/* Allow Refill */}
              <div 
                onClick={() => updateCurrentDraft(d => ({ ...d, allowRefill: !d.allowRefill }))}
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  currentDraft.allowRefill ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Activity size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Allow Refill</p>
                  <p className="text-[10px] font-bold text-emerald-700">{currentDraft.allowRefill ? '✓ Enabled' : 'Disabled'}</p>
                </div>
              </div>

              {/* Add Note */}
              <div 
                className="p-3 rounded-xl border bg-blue-50/70 border-blue-300 flex items-center gap-2.5 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900">Add Note</p>
                  <input 
                    type="text" 
                    value={currentDraft.note}
                    onChange={(e) => updateCurrentDraft(d => ({ ...d, note: e.target.value }))}
                    placeholder="Optional note"
                    className="w-full text-[10px] text-blue-700 bg-transparent outline-none truncate"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  updateCurrentDraft(draft => ({
                    ...draft,
                    medicines: [draft.medicines[0]],
                    note: ''
                  }));
                  addToast?.('Prescription scratchpad cleared.', 'info');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleSavePrescription}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Save Prescription
              </button>

              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Printer size={14} />
                <span>Print / Share</span>
              </button>

              <button
                type="button"
                onClick={handleSendToPatient}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Send size={14} />
                <span>Send to Patient</span>
              </button>
            </div>

          </div>

        </div>

        {/* ======================================================= */}
        {/* COLUMN 3: PATIENT SUMMARY & MEDICATION TRACKER (Right)  */}
        {/* ======================================================= */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Card 1: Patient Summary */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Patient Summary</h3>
              <button 
                type="button"
                onClick={() => addToast?.(`Navigating to full records of ${selectedPatient.name}`, 'info')}
                className="text-xs font-bold text-blue-600 hover:text-blue-500"
              >
                More →
              </button>
            </div>

            {/* Profile Row */}
            <div className="flex items-center gap-3">
              <img 
                src={selectedPatient.avatar} 
                alt={selectedPatient.name} 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <h4 className="text-sm font-black text-slate-900">{selectedPatient.name}</h4>
                <p className="text-xs text-slate-500">
                  {selectedPatient.gender}/{selectedPatient.age} • PID: {selectedPatient.pid}
                </p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                  ● Active
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-800">{selectedPatient.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400" />
                <span>{selectedPatient.location}</span>
              </div>
            </div>

            {/* Visits & Appointments */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-50">
                <p className="text-slate-400 font-bold">Last Visit</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPatient.lastVisit}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <p className="text-slate-400 font-bold">Next Appointment</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPatient.nextAppointment}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Medication Tracker (Radial Adherence + Checklist) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Medication Tracker</h3>
              <button 
                type="button"
                onClick={() => addToast?.('Medication adherence detail report opened.', 'info')}
                className="text-xs font-bold text-blue-600 hover:text-blue-500"
              >
                View Details →
              </button>
            </div>

            {/* Radial Adherence Progress Ring */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="14" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    strokeDasharray="88" 
                    strokeDashoffset={88 - (88 * selectedPatient.adherenceRate) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black font-mono text-slate-900">{selectedPatient.adherenceRate}%</span>
                  <span className="text-[9px] font-bold text-slate-500 block">On Time</span>
                </div>
              </div>
            </div>

            {/* Next Dose Indicator */}
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
              <p className="text-xs text-slate-600 font-medium">Next Dose</p>
              <p className="text-sm font-black text-blue-700">Today, 8:00 PM</p>
            </div>

            {/* Send Reminder Button */}
            <button
              type="button"
              onClick={() => addToast?.(`Dose alarm notification dispatched to ${selectedPatient.name}'s phone.`, 'success')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Bell size={14} />
              <span>Send Reminder</span>
            </button>

            {/* Dose Timeline Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {doses.map(d => (
                <div 
                  key={d.id}
                  onClick={() => handleToggleDose(d.id)}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {d.status === 'Taken' ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                    <span className="font-semibold text-slate-700">{d.time}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    d.status === 'Taken' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* BOTTOM 3 PANELS: ACTIVE PRESCRIPTIONS, INTAKE, ACTIONS    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* PANEL 1: Active Prescriptions (5) Table */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Active Prescriptions ({activePrescriptions.length})
              </h4>
              <button 
                type="button" 
                onClick={() => addToast?.('Viewing all master prescription logs.', 'info')}
                className="text-xs font-bold text-blue-600 hover:text-blue-500"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100 pb-2">
                    <th className="py-2">Medicine</th>
                    <th className="py-2">Dose</th>
                    <th className="py-2">Duration</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activePrescriptions.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-bold text-slate-800 flex items-center gap-2">
                        <Pill size={13} className="text-blue-600" />
                        <span className="truncate max-w-[130px]">{item.medicine}</span>
                      </td>
                      <td className="py-2.5 text-slate-600 font-medium">{item.dose}</td>
                      <td className="py-2.5 text-slate-600">{item.duration}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          ● {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-slate-400">
                          <button 
                            type="button"
                            onClick={() => addToast?.(`Rx details: ${item.medicine}`, 'info')}
                            className="hover:text-blue-600 p-1"
                          >
                            <Eye size={13} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setActivePrescriptions(prev => prev.filter(r => r.id !== item.id));
                              addToast?.(`Removed prescription: ${item.medicine}`, 'info');
                            }}
                            className="hover:text-rose-600 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PANEL 2: Medication Intake Overview (7-Day Bar Chart) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-blue-600" />
                <span>Medication Intake Overview</span>
              </h4>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                Last 7 Days ⌵
              </span>
            </div>

            {/* 7-Day Emerald Bar Chart */}
            <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 pb-2">
              {[
                { day: 'Mon', val: 100 },
                { day: 'Tue', val: 95 },
                { day: 'Wed', val: 90 },
                { day: 'Thu', val: 100 },
                { day: 'Fri', val: 92 },
                { day: 'Sat', val: 96 },
                { day: 'Sun', val: 100 },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-black text-emerald-700">{b.val}%</span>
                  <div 
                    className="w-full rounded-md bg-emerald-500 hover:bg-emerald-400 transition-all shadow-xs"
                    style={{ height: `${(b.val / 100) * 85}px` }}
                  />
                  <span className="text-[10px] font-bold text-slate-500">{b.day}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center font-medium">
            Overall 7-Day Compliance Score: <strong className="text-emerald-600">96.1%</strong>
          </p>
        </div>

        {/* PANEL 3: Quick Actions Tiles */}
        <div className="lg:col-span-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-amber-500">⚡</span>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Actions</h4>
          </div>

          <div className="grid grid-cols-2 gap-2.5 my-auto">
            {/* Add Prescription */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('new_rx');
                addToast?.('Prescription studio activated.', 'info');
              }}
              className="p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-700 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                <span className="font-serif font-black text-xs">Rx</span>
              </div>
              <span className="text-[11px] font-black leading-tight">Add Prescription</span>
            </button>

            {/* View Reports */}
            <button
              type="button"
              onClick={() => onNavigate?.('diagnostic_lab')}
              className="p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                <TrendingUp size={15} />
              </div>
              <span className="text-[11px] font-black leading-tight">View Reports</span>
            </button>

            {/* Manage Reminders */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('tracker');
                addToast?.('Medication alarm manager open.', 'info');
              }}
              className="p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-purple-700 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                <Bell size={15} />
              </div>
              <span className="text-[11px] font-black leading-tight">Manage Reminders</span>
            </button>

            {/* Patient Records */}
            <button
              type="button"
              onClick={() => onNavigate?.('records')}
              className="p-3 rounded-2xl bg-teal-50/80 hover:bg-teal-100 border border-teal-200 text-teal-700 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
                <FileText size={15} />
              </div>
              <span className="text-[11px] font-black leading-tight">Patient Records</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center font-mono mt-2">
            Integrated with MoH Uganda Clinical Guidelines
          </p>
        </div>

      </div>

      {/* ========================================================= */}
      {/* PRINTABLE / SHARE RX MODAL                                */}
      {/* ========================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-serif font-black">
                  Rx
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Doctorian Medical Prescription</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Official Clinical Dispense Order</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Prescribing Doctor Header */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <p className="font-extrabold text-slate-900">Prescribing Physician: Dr. Joseph Akora</p>
                <p className="text-[10px] text-slate-500">Ministry of Health Registered Medical Practitioner</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-slate-700 font-bold">{new Date().toLocaleDateString()}</p>
                <p className="text-[10px] text-emerald-600 font-bold">Encrypted & Verified</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="text-xs space-y-1">
              <p className="text-slate-600">Patient: <strong className="text-slate-900">{selectedPatient.name}</strong> ({selectedPatient.gender}/{selectedPatient.age})</p>
              <p className="text-slate-600">Patient ID: <strong className="text-slate-900">{selectedPatient.pid}</strong> · Diagnosis: <strong className="text-blue-700">{currentDraft.diagnosis}</strong></p>
            </div>

            {/* Medication Schedule List */}
            <div className="space-y-2 border-t border-b border-slate-200 py-3">
              {currentDraft.medicines.map((m, i) => (
                <div key={m.id} className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{i + 1}. {m.medicine}</p>
                    <p className="text-[10px] text-slate-500">{m.dosage} · {m.frequency} for {m.duration}</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {m.instructions}
                  </span>
                </div>
              ))}
            </div>

            {currentDraft.note && (
              <p className="text-[11px] text-slate-600 italic">
                Special Note: "{currentDraft.note}"
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Document</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToast?.(`Prescription download generated for ${selectedPatient.name}`, 'success');
                  setShowPrintModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 size={14} />
                <span>Share PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NEW PATIENT REGISTRATION MODAL                            */}
      {/* ========================================================= */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddNewPatient}
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-900">Register New Patient</h3>
              <button 
                type="button" 
                onClick={() => setShowNewPatientModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Patient Name</label>
              <input 
                type="text" 
                required
                value={newPatientForm.name}
                onChange={(e) => setNewPatientForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Florence Namusisi"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input 
                  type="number" 
                  required
                  value={newPatientForm.age}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, age: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={newPatientForm.gender}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="F">Female (F)</option>
                  <option value="M">Male (M)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telephone / WhatsApp Contact</label>
              <input 
                type="text" 
                required
                value={newPatientForm.phone}
                onChange={(e) => setNewPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District / Region</label>
              <input 
                type="text" 
                value={newPatientForm.location}
                onChange={(e) => setNewPatientForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewPatientModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                Register Patient
              </button>
            </div>
          </form>
        </div>
      )}

      </div>
    </div>
  );
};

export default MedicationTracker;
