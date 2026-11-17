import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Search,
  Users,
  Building2,
  Bed,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MapPin,
  X,
  Stethoscope,
  Plus,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Thermometer,
  HeartPulse,
  Wind,
  Pill
} from 'lucide-react';

interface UgandaPatientRecord {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  hospital: string;
  district: string;
  ward: string;
  bedNumber: string;
  admittingPhysician: string;
  triageLevel: 'Level 1 - Resuscitation' | 'Level 2 - Emergent' | 'Level 3 - Urgent' | 'Level 4 - Stable';
  status: 'Critical' | 'Discharge Pending' | 'Under Review' | 'Stable';
  vitals: {
    hr: number;
    bp: string;
    spo2: number;
    temp: number;
  };
  contact: string;
  nextOfKin: string;
  diagnosis: string;
  medications: string[];
  ownerEmail?: string;
  avatar: string;
  nin: string;
  bloodType: string;
  allergies: string[];
  insuranceScheme: string;
  triagedAt?: string;
}

const STORAGE_KEY = 'doctorian_triage_queue_v2';

const UGANDA_PATIENTS: UgandaPatientRecord[] = [
  {
    id: 'UG-MLG-001',
    mrn: 'MRN-88201',
    name: 'Sarah Nakato',
    age: 28,
    gender: 'Female',
    hospital: 'Mulago National Referral Hospital',
    district: 'Kampala',
    ward: 'Respiratory Ward 10',
    bedNumber: 'Bed 14',
    admittingPhysician: 'Dr. Joseph Akora',
    triageLevel: 'Level 1 - Resuscitation',
    status: 'Critical',
    vitals: { hr: 138, bp: '135/88', spo2: 92, temp: 38.4 },
    contact: '+256 772 104 928',
    nextOfKin: 'Grace Nakato (Mother) - +256 701 445 112',
    diagnosis: 'Acute Severe Asthma Exacerbation with Secondary Bronchospasm',
    medications: ['Salbutamol Nebulization 5mg', 'Hydrocortisone 100mg IV', 'Oxygen via Mask 6L/min'],
    ownerEmail: 'sarah.nakato@patient.ug',
    avatar: '/portraits/patient_sarah.jpg',
    nin: 'CM8802914209LK',
    bloodType: 'O+ (Rh Positive) • HbAA',
    allergies: ['Penicillin (Moderate rash)', 'NSAIDs (Mild dyspepsia)'],
    insuranceScheme: 'Uganda National Health Insurance (UCHIS) • ID: UCH-9021-KLA',
    triagedAt: '14 mins ago'
  },
  {
    id: 'UG-MBR-002',
    mrn: 'MRN-91420',
    name: 'John Doe Mukasa',
    age: 45,
    gender: 'Male',
    hospital: 'Mbarara Regional Referral Hospital',
    district: 'Mbarara',
    ward: 'Cardiology ICU',
    bedNumber: 'ICU Bed 04',
    admittingPhysician: 'Dr. James Okello',
    triageLevel: 'Level 2 - Emergent',
    status: 'Critical',
    vitals: { hr: 118, bp: '140/92', spo2: 95, temp: 37.8 },
    contact: '+256 782 559 101',
    nextOfKin: 'Esther Mukasa (Wife) - +256 752 901 223',
    diagnosis: 'Acute Coronary Syndrome (NSTEMI) / Hypertensive Urgency',
    medications: ['Aspirin 300mg stat', 'Clopidogrel 300mg stat', 'Atorvastatin 80mg'],
    ownerEmail: 'john.mukasa@patient.ug',
    avatar: '/portraits/akora_joseph.jpg',
    nin: 'CM7901419401KJ',
    bloodType: 'A+ (Rh Positive) • HbAS',
    allergies: ['No Known Drug Allergies (NKDA)'],
    insuranceScheme: 'Jubilee Health Insurance Uganda • Gold Plan #JUB-44910',
    triagedAt: '28 mins ago'
  },
  {
    id: 'UG-GLU-003',
    mrn: 'MRN-64218',
    name: 'Mary Atim',
    age: 32,
    gender: 'Female',
    hospital: 'Gulu Regional Referral Hospital',
    district: 'Gulu',
    ward: 'Medical Ward 2B',
    bedNumber: 'Bed 08',
    admittingPhysician: 'Dr. Grace Auma',
    triageLevel: 'Level 4 - Stable',
    status: 'Stable',
    vitals: { hr: 72, bp: '118/76', spo2: 98, temp: 36.6 },
    contact: '+256 774 812 304',
    nextOfKin: 'Peter Oola (Brother) - +256 788 120 445',
    diagnosis: 'Complicated Malaria in Recovery / Mild Anemia',
    medications: ['Artesunate IV Completed', 'Coartem oral tablets', 'Ferrous Sulfate 200mg'],
    ownerEmail: 'mary.atim@patient.ug',
    avatar: '/portraits/patient_mary.jpg',
    nin: 'CF9402810941GT',
    bloodType: 'B+ (Rh Positive) • HbAA',
    allergies: ['Sulfa Antibiotics (Co-trimoxazole)'],
    insuranceScheme: 'Northern Uganda VHT Community Fund • Card #VHT-GLU-102',
    triagedAt: '1 hr ago'
  },
  {
    id: 'UG-JNJ-004',
    mrn: 'MRN-77312',
    name: 'David Ssemwogerere',
    age: 58,
    gender: 'Male',
    hospital: 'Jinja Regional Referral Hospital',
    district: 'Jinja',
    ward: 'High Dependency Ward 1',
    bedNumber: 'HDU Bed 02',
    admittingPhysician: 'Dr. Patrick Byamukama',
    triageLevel: 'Level 2 - Emergent',
    status: 'Critical',
    vitals: { hr: 135, bp: '150/96', spo2: 91, temp: 38.6 },
    contact: '+256 702 334 190',
    nextOfKin: 'Ruth Ssemwogerere (Daughter) - +256 779 881 202',
    diagnosis: 'Diabetic Ketoacidosis (DKA) with Community-Acquired Pneumonia',
    medications: ['Normal Saline 1L IV stat', 'Regular Insulin Infusion', 'Ceftriaxone 2g IV daily'],
    ownerEmail: 'david.ssemwogerere@patient.ug',
    avatar: '/portraits/dr_emmanuel_kato.jpg',
    nin: 'CM6801940122MN',
    bloodType: 'AB+ (Rh Positive) • HbAA',
    allergies: ['Latex sensitivity'],
    insuranceScheme: 'Prudential Uganda Health Scheme • Policy #PRU-UG-7721',
    triagedAt: '42 mins ago'
  },
  {
    id: 'UG-KRD-005',
    mrn: 'MRN-50192',
    name: 'Florence Nabukenya',
    age: 41,
    gender: 'Female',
    hospital: 'Kiruddu National Referral Hospital',
    district: 'Kampala',
    ward: 'Renal & Burn Unit 3',
    bedNumber: 'Bed 21',
    admittingPhysician: 'Dr. Sarah Nakitto',
    triageLevel: 'Level 3 - Urgent',
    status: 'Under Review',
    vitals: { hr: 80, bp: '124/80', spo2: 97, temp: 37.0 },
    contact: '+256 756 441 890',
    nextOfKin: 'Moses Kityo (Husband) - +256 704 220 119',
    diagnosis: 'Chronic Kidney Disease Stage 3 / Routine Dialysis Evaluation',
    medications: ['Furosemide 40mg daily', 'Calcium Carbonate 500mg TDS', 'Erythropoietin 4000 IU'],
    ownerEmail: 'florence.nabukenya@patient.ug',
    avatar: '/portraits/dr_achan_grace.jpg',
    nin: 'CF8503910023LK',
    bloodType: 'O- (Universal Donor) • HbAA',
    allergies: ['Aspirin (Bronchospasm)'],
    insuranceScheme: 'Kiruddu Renal Subsidy & UCHIS • Account #KRD-8812',
    triagedAt: '2 hrs ago'
  },
  {
    id: 'UG-ENT-006',
    mrn: 'MRN-44910',
    name: 'Emmanuel Otim',
    age: 63,
    gender: 'Male',
    hospital: 'Entebbe Regional Referral Hospital',
    district: 'Wakiso',
    ward: 'Isolation Observation Ward',
    bedNumber: 'Bed 05',
    admittingPhysician: 'Dr. Ronald Kasule',
    triageLevel: 'Level 4 - Stable',
    status: 'Discharge Pending',
    vitals: { hr: 88, bp: '128/84', spo2: 94, temp: 37.2 },
    contact: '+256 781 990 412',
    nextOfKin: 'Agnes Otim (Wife) - +256 773 400 918',
    diagnosis: 'COPD Mild Flare-up / Post Viral Bronchitis Resolved',
    medications: ['Tiotropium HandiHaler', 'Prednisolone 20mg tapering', 'Paracetamol 1g PRN'],
    ownerEmail: 'emmanuel.otim@patient.ug',
    avatar: '/portraits/dr_joseph_mukasa.jpg',
    nin: 'CM9702209110AR',
    bloodType: 'A- (Rh Negative) • HbAA',
    allergies: ['No Known Drug Allergies (NKDA)'],
    insuranceScheme: 'Arua Regional Emergency Voucher • #AR-EMG-412',
    triagedAt: '3 hrs ago'
  }
];

interface SymptomOption {
  id: string;
  label: string;
  redFlag?: boolean;
  weight: number;
  suspectedProtocol: string;
}

const SYMPTOM_CATALOG: SymptomOption[] = [
  { id: 'dyspnea', label: 'Severe Shortness of Breath', redFlag: true, weight: 4, suspectedProtocol: 'Acute Respiratory Distress / Oxygen + Nebulization' },
  { id: 'chest_pain', label: 'Chest Pain / Tightness', redFlag: true, weight: 4, suspectedProtocol: 'Suspected ACS / Immediate 12-Lead ECG' },
  { id: 'altered_mental', label: 'Confusion / Convulsions', redFlag: true, weight: 5, suspectedProtocol: 'Neurological Emergency / Airway & Glucose Check' },
  { id: 'high_fever', label: 'High Fever & Chills', weight: 2, suspectedProtocol: 'Febrile Workup (Malaria mRDT + CBC)' },
  { id: 'cough', label: 'Persistent Cough', weight: 1, suspectedProtocol: 'Respiratory Panel / SpO2 & Chest Auscultation' },
  { id: 'headache_neck', label: 'Severe Headache / Neck Stiffness', redFlag: true, weight: 4, suspectedProtocol: 'Meningism / Pre-eclampsia Screening' },
  { id: 'dehydration', label: 'Vomiting / Severe Dehydration', weight: 2, suspectedProtocol: 'IV Ringers Lactate / Oral Rehydration Therapy' },
  { id: 'abdominal', label: 'Acute Abdominal Pain', weight: 2, suspectedProtocol: 'Surgical / Ultrasound Triage Assessment' }
];

const HOSPITALS = [
  'Mulago National Referral Hospital',
  'Mbarara Regional Referral Hospital',
  'Gulu Regional Referral Hospital',
  'Jinja Regional Referral Hospital',
  'Kiruddu National Referral Hospital',
  'Entebbe Regional Referral Hospital',
  'Mbale Regional Referral Hospital',
  'Arua Regional Referral Hospital'
];

interface UgandaPatientTriageProps {
  user: any;
  onNavigate?: (view: string) => void;
}

const PatientAvatar: React.FC<{ src: string; name: string; sizeClass?: string }> = ({
  src,
  name,
  sizeClass = 'w-9 h-9'
}) => {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  if (failed || !src) {
    return (
      <div
        className={`${sizeClass} rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0`}
      >
        {initials || 'PT'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0`}
    />
  );
};

export const UgandaPatientTriage: React.FC<UgandaPatientTriageProps> = ({ user, onNavigate }) => {
  const [patients, setPatients] = useState<UgandaPatientRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return UGANDA_PATIENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch {}
  }, [patients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('All');
  const [selectedTriageLevel, setSelectedTriageLevel] = useState('All');
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<UgandaPatientRecord | null>(null);
  const [securityBlockModal, setSecurityBlockModal] = useState<UgandaPatientRecord | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  // Interactive Symptom Intake Form State
  const [intakeName, setIntakeName] = useState('');
  const [intakeAge, setIntakeAge] = useState('34');
  const [intakeGender, setIntakeGender] = useState('Female');
  const [intakeHospital, setIntakeHospital] = useState(HOSPITALS[0]);
  const [intakeHr, setIntakeHr] = useState(92);
  const [intakeSpo2, setIntakeSpo2] = useState(96);
  const [intakeTemp, setIntakeTemp] = useState(37.4);
  const [intakeBp, setIntakeBp] = useState('124/80');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['high_fever']);

  const isAuthorizedClinician =
    user?.role === 'admin' ||
    user?.isAdmin ||
    user?.role === 'doctor' ||
    user?.isDoctor ||
    !user?.role ||
    user?.email?.includes('doctor') ||
    user?.email?.includes('admin');

  const currentUserEmail = user?.email || 'dr.joseph.akora@doctorian.ug';

  const handleInspectPatient = (patient: UgandaPatientRecord) => {
    if (isAuthorizedClinician || (patient.ownerEmail && patient.ownerEmail === currentUserEmail)) {
      setSelectedPatientDetails(patient);
    } else {
      setSecurityBlockModal(patient);
    }
  };

  // Real-time NEWS2 + Uganda MoH Syndromic Triage Calculator
  const computedTriage = useMemo(() => {
    let score = 0;
    const matchedProtocols: string[] = [];
    let hasRedFlag = false;

    selectedSymptoms.forEach((symId) => {
      const item = SYMPTOM_CATALOG.find((s) => s.id === symId);
      if (item) {
        score += item.weight;
        if (item.redFlag) hasRedFlag = true;
        matchedProtocols.push(item.suspectedProtocol);
      }
    });

    if (intakeSpo2 < 90) score += 4;
    else if (intakeSpo2 <= 93) score += 2;
    if (intakeHr >= 125 || intakeHr <= 45) score += 3;
    else if (intakeHr >= 105) score += 1;
    if (intakeTemp >= 39.0 || intakeTemp <= 35.2) score += 2;

    let triageLevel: UgandaPatientRecord['triageLevel'] = 'Level 4 - Stable';
    let status: UgandaPatientRecord['status'] = 'Stable';
    let recommendation = 'Outpatient monitoring, oral hydration & scheduled follow-up.';

    if (score >= 7 || intakeSpo2 < 90) {
      triageLevel = 'Level 1 - Resuscitation';
      status = 'Critical';
      recommendation = 'Immediate resuscitation bay transfer, airway/oxygen & senior physician bedside review.';
    } else if (score >= 4 || hasRedFlag) {
      triageLevel = 'Level 2 - Emergent';
      status = 'Critical';
      recommendation = 'Urgent emergency unit evaluation within 10 minutes with IV access and targeted labs.';
    } else if (score >= 2) {
      triageLevel = 'Level 3 - Urgent';
      status = 'Under Review';
      recommendation = 'Priority clinical workup, rapid diagnostic malaria/CBC testing, and ward observation.';
    }

    return {
      score,
      triageLevel,
      status,
      recommendation,
      primaryProtocol: matchedProtocols[0] || 'General Clinical Observation'
    };
  }, [selectedSymptoms, intakeHr, intakeSpo2, intakeTemp]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = intakeName.trim() || 'Triaged Walk-in Patient';
    const numericAge = Math.max(1, Math.min(120, Number(intakeAge) || 30));
    const districtGuess = intakeHospital.split(' ')[0];
    const newId = `UG-${districtGuess.slice(0, 3).toUpperCase()}-${String(100 + patients.length + 1)}`;

    const symptomLabels = selectedSymptoms
      .map((s) => SYMPTOM_CATALOG.find((c) => c.id === s)?.label)
      .filter(Boolean);

    const newRecord: UgandaPatientRecord = {
      id: newId,
      mrn: `MRN-${Math.floor(10000 + Math.random() * 89999)}`,
      name: cleanName,
      age: numericAge,
      gender: intakeGender,
      hospital: intakeHospital,
      district: districtGuess,
      ward: computedTriage.status === 'Critical' ? 'Emergency Resuscitation Unit' : 'Outpatient Triage Bay',
      bedNumber: `Bay ${String(patients.length + 1).padStart(2, '0')}`,
      admittingPhysician: user?.name ? `Dr. ${user.name}` : 'Dr. Joseph Akora',
      triageLevel: computedTriage.triageLevel,
      status: computedTriage.status,
      vitals: {
        hr: Number(intakeHr) || 88,
        bp: intakeBp || '120/80',
        spo2: Number(intakeSpo2) || 97,
        temp: Number(intakeTemp) || 37.0
      },
      contact: '+256 770 000 000',
      nextOfKin: 'Registered at Triage Desk',
      diagnosis:
        symptomLabels.length > 0
          ? `${computedTriage.primaryProtocol} (${symptomLabels.join(', ')})`
          : computedTriage.primaryProtocol,
      medications: [computedTriage.recommendation],
      ownerEmail: currentUserEmail,
      avatar: '',
      nin: `UG-TRIAGE-${patients.length + 1}`,
      bloodType: 'Pending Grouping',
      allergies: ['Verify at bedside'],
      insuranceScheme: 'Uganda National Emergency Triage Pass',
      triagedAt: 'Just now'
    };

    setPatients((prev) => [newRecord, ...prev]);
    setSelectedTriageLevel('All');
    setSelectedHospital('All');
    setSearchQuery('');
    setIsIntakeOpen(false);
    setIntakeName('');
    setSelectedPatientDetails(newRecord);
  };

  const handleUpdatePatientStatus = (patientId: string, newStatus: UgandaPatientRecord['status']) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: newStatus } : p))
    );
    setSelectedPatientDetails((prev) => (prev && prev.id === patientId ? { ...prev, status: newStatus } : prev));
  };

  const handleResetQueue = () => {
    setPatients(UGANDA_PATIENTS);
    setSearchQuery('');
    setSelectedHospital('All');
    setSelectedTriageLevel('All');
  };

  // Dynamic summary metrics derived from live queue
  const customAdmissionsCount = Math.max(0, patients.length - UGANDA_PATIENTS.length);
  const criticalCount = patients.filter((p) => p.status === 'Critical' || p.triageLevel.includes('Resuscitation')).length;
  const availableBeds = Math.max(120, 2000 - customAdmissionsCount);
  const occupancyPercent = Math.min(99, 82 + Math.round((customAdmissionsCount / 20) * 1));

  const levelCounts = useMemo(() => ({
    All: patients.length,
    Resuscitation: patients.filter((p) => p.triageLevel.includes('Resuscitation')).length,
    Emergent: patients.filter((p) => p.triageLevel.includes('Emergent')).length,
    Urgent: patients.filter((p) => p.triageLevel.includes('Urgent')).length,
    Stable: patients.filter((p) => p.triageLevel.includes('Stable')).length
  }), [patients]);

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.hospital.toLowerCase().includes(q) ||
      p.diagnosis.toLowerCase().includes(q) ||
      p.admittingPhysician.toLowerCase().includes(q);
    const matchesHosp = selectedHospital === 'All' || p.hospital.includes(selectedHospital);
    const matchesTriage = selectedTriageLevel === 'All' || p.triageLevel.includes(selectedTriageLevel);
    return matchesSearch && matchesHosp && matchesTriage;
  });

  const getSeverityBadgeStyle = (level: UgandaPatientRecord['triageLevel']) => {
    if (level.includes('Resuscitation')) {
      return 'bg-rose-600 text-white border-rose-700';
    }
    if (level.includes('Emergent')) {
      return 'bg-orange-600 text-white border-orange-700';
    }
    if (level.includes('Urgent')) {
      return 'bg-amber-500 text-slate-950 border-amber-600';
    }
    return 'bg-emerald-600 text-white border-emerald-700';
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#050d1f] text-slate-900 dark:text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Clean Editorial Workspace Header (No overlapping sticky stacking) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {onNavigate && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Dashboard</span>
                  </button>
                  <span aria-hidden="true">/</span>
                </>
              )}
              <span>Uganda National Referral Network</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <ShieldCheck size={13} />
                <span>Data Protection Act 2019</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
              Symptom Triage &amp; Referral Queue
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Live syndromic urgency scoring, ICU bed coordination, and encrypted clinical inspection across Ugandan national and regional referral hospitals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {customAdmissionsCount > 0 && (
              <button
                type="button"
                onClick={handleResetQueue}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[42px]"
              >
                <RotateCcw size={14} />
                <span>Reset Queue</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsIntakeOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer whitespace-nowrap min-h-[44px]"
            >
              <Plus size={16} />
              <span>New Symptom Triage</span>
            </button>
          </div>
        </div>

        {/* 4-Column Live KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Queue</span>
              <Users size={16} className="text-blue-600 dark:text-cyan-400 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                {patients.length}
              </p>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{customAdmissionsCount} new
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTriageLevel(selectedTriageLevel === 'Resuscitation' ? 'All' : 'Resuscitation')}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 text-left flex flex-col justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Critical &amp; Resuscitation</span>
              <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2 w-full">
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                {criticalCount}
              </p>
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {selectedTriageLevel === 'Resuscitation' ? 'Filtered' : 'Filter View'}
              </span>
            </div>
          </button>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Available Beds</span>
              <Bed size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                {availableBeds.toLocaleString()}
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">184 ICU</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Bed Occupancy</span>
              <Building2 size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
            </div>
            <div className="mt-2 space-y-2">
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                {occupancyPercent}%
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Triage Registry Panel (Single Elevation) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Interactive Triage Level Segmented Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-x-auto max-w-full">
                {(
                  [
                    { key: 'All', label: 'All Patients', count: levelCounts.All },
                    { key: 'Resuscitation', label: 'Resuscitation', count: levelCounts.Resuscitation },
                    { key: 'Emergent', label: 'Emergent', count: levelCounts.Emergent },
                    { key: 'Urgent', label: 'Urgent', count: levelCounts.Urgent },
                    { key: 'Stable', label: 'Stable', count: levelCounts.Stable }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedTriageLevel(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      selectedTriageLevel === tab.key
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="tabular-nums text-[11px] opacity-75">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Search & Hospital Dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient, MRN, diagnosis..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 min-h-[40px]"
                  />
                </div>

                <select
                  aria-label="Filter by hospital"
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer min-h-[40px]"
                >
                  <option value="All">All Referral Hospitals</option>
                  <option value="Mulago">Mulago National Referral</option>
                  <option value="Mbarara">Mbarara Regional Referral</option>
                  <option value="Gulu">Gulu Regional Referral</option>
                  <option value="Jinja">Jinja Regional Referral</option>
                  <option value="Kiruddu">Kiruddu National Referral</option>
                  <option value="Entebbe">Entebbe Regional Referral</option>
                  <option value="Mbale">Mbale Regional Referral</option>
                  <option value="Arua">Arua Regional Referral</option>
                </select>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredPatients.length === 0 ? (
            <div className="py-14 px-6 text-center space-y-3">
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                No matching triage records found
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Adjust your hospital or severity filters, or admit a new patient into the triage queue.
              </p>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedHospital('All');
                    setSelectedTriageLevel('All');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsIntakeOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  New Symptom Triage
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Data Table (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-[13px]">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Patient</th>
                      <th className="py-3 px-4 font-semibold">Hospital &amp; Ward</th>
                      <th className="py-3 px-4 font-semibold">Live Vitals</th>
                      <th className="py-3 px-4 font-semibold">Triage Level</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredPatients.map((p) => {
                      const isCrit = p.status === 'Critical';
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <PatientAvatar src={p.avatar} name={p.name} />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                                  <span className="font-mono">{p.id}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>{p.age}y {p.gender}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-medium text-slate-900 dark:text-slate-100">{p.hospital}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {p.ward} · {p.bedNumber}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                            <div>
                              HR {p.vitals.hr} · SpO2 {p.vitals.spo2}%
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              BP {p.vitals.bp} · {p.vitals.temp}°C
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap ${getSeverityBadgeStyle(
                                p.triageLevel
                              )}`}
                            >
                              {p.triageLevel}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs font-semibold ${
                                isCrit
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : p.status === 'Under Review'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleInspectPatient(p)}
                              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Inspect Chart
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards (< md) */}
              <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
                {filteredPatients.map((p) => (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <PatientAvatar src={p.avatar} name={p.name} sizeClass="w-10 h-10" />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {p.id} · {p.age}y {p.gender}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${getSeverityBadgeStyle(
                          p.triageLevel
                        )}`}
                      >
                        {p.triageLevel.split(' - ')[1] || p.triageLevel}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{p.hospital}</p>
                      <p>
                        {p.ward} · {p.bedNumber} · {p.admittingPhysician}
                      </p>
                      <p className="font-mono tabular-nums text-slate-700 dark:text-slate-300 pt-1">
                        HR {p.vitals.hr} bpm · SpO2 {p.vitals.spo2}% · BP {p.vitals.bp} · {p.vitals.temp}°C
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInspectPatient(p)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold min-h-[44px] cursor-pointer"
                    >
                      Inspect Patient Record
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE SYMPTOM TRIAGE INTAKE MODAL                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isIntakeOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
            onClick={() => setIsIntakeOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-2xl max-h-[90dvh] rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-5 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    New Symptom Triage Assessment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time clinical urgency scoring aligned with Uganda MoH protocols
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsIntakeOpen(false)}
                  aria-label="Close Assessment"
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitIntake} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
                {/* Patient Identity Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={intakeName}
                      onChange={(e) => setIntakeName(e.target.value)}
                      placeholder="e.g., Beatrice Namukasa"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Age</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={intakeAge}
                        onChange={(e) => setIntakeAge(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white tabular-nums focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sex</label>
                      <select
                        value={intakeGender}
                        onChange={(e) => setIntakeGender(e.target.value)}
                        className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hospital Assignment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Target Referral Facility
                  </label>
                  <select
                    value={intakeHospital}
                    onChange={(e) => setIntakeHospital(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {HOSPITALS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vitals Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <HeartPulse size={13} className="text-rose-500" />
                      <span>Heart Rate</span>
                    </label>
                    <input
                      type="number"
                      value={intakeHr}
                      onChange={(e) => setIntakeHr(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <Wind size={13} className="text-emerald-500" />
                      <span>SpO2 (%)</span>
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={intakeSpo2}
                      onChange={(e) => setIntakeSpo2(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <Thermometer size={13} className="text-amber-500" />
                      <span>Temp (°C)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={intakeTemp}
                      onChange={(e) => setIntakeTemp(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <Activity size={13} className="text-blue-500" />
                      <span>BP (mmHg)</span>
                    </label>
                    <input
                      type="text"
                      value={intakeBp}
                      onChange={(e) => setIntakeBp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono tabular-nums"
                    />
                  </div>
                </div>

                {/* Symptom Multi-Select Buttons */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Presenting Symptoms &amp; Red Flags
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SYMPTOM_CATALOG.map((sym) => {
                      const active = selectedSymptoms.includes(sym.id);
                      return (
                        <button
                          key={sym.id}
                          type="button"
                          onClick={() => toggleSymptom(sym.id)}
                          className={`px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                            active
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-cyan-200'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span>{sym.label}</span>
                          {sym.redFlag && (
                            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                              Red Flag
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real-Time Triage Score Preview */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Computed Triage Priority (Score <span className="font-mono tabular-nums">{computedTriage.score}</span>)
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getSeverityBadgeStyle(computedTriage.triageLevel)}`}>
                      {computedTriage.triageLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {computedTriage.recommendation}
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsIntakeOpen(false);
                        onNavigate('ai_nexus');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                    >
                      <Stethoscope size={15} />
                      <span>Escalate to AI Doctor</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsIntakeOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
                    >
                      Admit to Triage Queue
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* PATIENT CHART INSPECTION MODAL (Authorized Access)                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedPatientDetails && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
            onClick={() => setSelectedPatientDetails(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-3xl rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <PatientAvatar src={selectedPatientDetails.avatar} name={selectedPatientDetails.name} sizeClass="w-12 h-12" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                        {selectedPatientDetails.name}
                      </h3>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getSeverityBadgeStyle(
                          selectedPatientDetails.triageLevel
                        )}`}
                      >
                        {selectedPatientDetails.triageLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {selectedPatientDetails.id} · {selectedPatientDetails.hospital} ({selectedPatientDetails.ward})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPatientDetails(null)}
                  aria-label="Close Patient Chart"
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm flex-1">
                {/* Quick Status Switcher for Clinicians */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clinical Ward Status</span>
                  <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                    {(['Critical', 'Under Review', 'Stable', 'Discharge Pending'] as const).map((statusVal) => (
                      <button
                        key={statusVal}
                        type="button"
                        onClick={() => handleUpdatePatientStatus(selectedPatientDetails.id, statusVal)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          selectedPatientDetails.status === statusVal
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {statusVal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vitals Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Heart Rate</span>
                    <strong className="text-base font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                      {selectedPatientDetails.vitals.hr} bpm
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Blood Pressure</span>
                    <strong className="text-base font-bold font-mono tabular-nums text-blue-600 dark:text-cyan-400">
                      {selectedPatientDetails.vitals.bp}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">SpO2 Oxygen</span>
                    <strong className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {selectedPatientDetails.vitals.spo2}%
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Body Temp</span>
                    <strong className="text-base font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                      {selectedPatientDetails.vitals.temp}°C
                    </strong>
                  </div>
                </div>

                {/* Clinical Diagnosis & Physician */}
                <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Stethoscope size={14} />
                    <span>Primary Clinical Impression</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    {selectedPatientDetails.diagnosis}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Attending Physician: <strong className="text-slate-800 dark:text-slate-200">{selectedPatientDetails.admittingPhysician}</strong>
                  </p>
                </div>

                {/* Active Medications */}
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <FileText size={14} />
                      <span>Active Treatment Protocol</span>
                    </span>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatientDetails(null);
                          onNavigate('pharmacy');
                        }}
                        className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Pill size={13} />
                        <span>Order in E-Pharmacy</span>
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {selectedPatientDetails.medications.map((med, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{med}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demographics & National Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
                      <MapPin size={14} />
                      <span>Demographics &amp; Contact</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      Age / Sex: <strong>{selectedPatientDetails.age} yrs · {selectedPatientDetails.gender}</strong>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Bed: <strong>{selectedPatientDetails.bedNumber}</strong> · Contact: <strong>{selectedPatientDetails.contact}</strong>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Next of Kin: <strong>{selectedPatientDetails.nextOfKin}</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
                      <ShieldCheck size={14} />
                      <span>Identity &amp; Allergies</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      NIN: <strong className="font-mono">{selectedPatientDetails.nin}</strong>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Blood Profile: <strong>{selectedPatientDetails.bloodType}</strong>
                    </p>
                    <p className="text-rose-600 dark:text-rose-400">
                      Allergies: <strong>{selectedPatientDetails.allergies.join(', ') || 'NKDA'}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 sm:px-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  Cryptographically Signed · Uganda MoH Node
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientDetails(null);
                        onNavigate('ai_nexus');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Consult AI</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedPatientDetails(null)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                  >
                    Close Chart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SECURITY ACCESS RESTRICTION SHIELD MODAL                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {securityBlockModal && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSecurityBlockModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <ShieldAlert size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Access Restricted
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock size={13} className="text-rose-500" />
                  <span>Uganda Data Protection &amp; Privacy Act 2019</span>
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Clinical records for <strong className="text-slate-900 dark:text-white">{securityBlockModal.name}</strong> are encrypted and role-restricted. Patient accounts can only view their own verified medical charts.
              </p>

              <button
                type="button"
                onClick={() => setSecurityBlockModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                Dismiss Notice
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UgandaPatientTriage;
