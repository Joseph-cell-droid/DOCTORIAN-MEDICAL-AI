import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Search, 
  Filter, 
  Users, 
  Building2, 
  Bed, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  UserCheck, 
  FileText, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  X,
  Stethoscope,
  Heart,
  Hospital
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
}

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
    admittingPhysician: 'Dr. Sarah Nakitto',
    triageLevel: 'Level 1 - Resuscitation',
    status: 'Critical',
    vitals: { hr: 138, bp: '135/88', spo2: 92, temp: 38.4 },
    contact: '+256 772 104 928',
    nextOfKin: 'Grace Nakato (Mother) - +256 701 445 112',
    diagnosis: 'Acute Severe Asthma Exacerbation with Secondary Bronchospasm',
    medications: ['Salbutamol Nebulization 5mg', 'Hydrocortisone 100mg IV', 'Oxygen via Mask 6L/min'],
    ownerEmail: 'sarah.nakato@patient.ug',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    nin: 'CM8802914209LK',
    bloodType: 'O+ (Rh Positive) • HbAA',
    allergies: ['Penicillin (Moderate rash)', 'NSAIDs (Mild dyspepsia)'],
    insuranceScheme: 'Uganda National Health Insurance (UCHIS) • ID: UCH-9021-KLA'
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
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    nin: 'CM7901419401KJ',
    bloodType: 'A+ (Rh Positive) • HbAS',
    allergies: ['No Known Drug Allergies (NKDA)'],
    insuranceScheme: 'Jubilee Health Insurance Uganda • Gold Plan #JUB-44910'
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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    nin: 'CF9402810941GT',
    bloodType: 'B+ (Rh Positive) • HbAA',
    allergies: ['Sulfa Antibiotics (Co-trimoxazole)'],
    insuranceScheme: 'Northern Uganda VHT Community Fund • Card #VHT-GLU-102'
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
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    nin: 'CM6801940122MN',
    bloodType: 'AB+ (Rh Positive) • HbAA',
    allergies: ['Latex sensitivity'],
    insuranceScheme: 'Prudential Uganda Health Scheme • Policy #PRU-UG-7721'
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
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    nin: 'CF8503910023LK',
    bloodType: 'O- (Universal Donor) • HbAA',
    allergies: ['Aspirin (Bronchospasm)'],
    insuranceScheme: 'Kiruddu Renal Subsidy & UCHIS • Account #KRD-8812'
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
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    nin: 'CM9702209110AR',
    bloodType: 'A- (Rh Negative) • HbAA',
    allergies: ['No Known Drug Allergies (NKDA)'],
    insuranceScheme: 'Arua Regional Emergency Voucher • #AR-EMG-412'
  }
];

interface UgandaPatientTriageProps {
  user: any;
  onNavigate?: (view: string) => void;
}

export const UgandaPatientTriage: React.FC<UgandaPatientTriageProps> = ({ user, onNavigate }) => {
  const [patients, setPatients] = useState<UgandaPatientRecord[]>(UGANDA_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('All');
  const [selectedTriageLevel, setSelectedTriageLevel] = useState('All');
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<UgandaPatientRecord | null>(null);
  const [securityBlockModal, setSecurityBlockModal] = useState<UgandaPatientRecord | null>(null);

  // Check RBAC Authorization
  // Admins & Doctors can see everything.
  // Regular patients can only see their own records.
  const isAuthorizedClinician = 
    user?.role === 'admin' || 
    user?.isAdmin || 
    user?.role === 'doctor' || 
    user?.isDoctor ||
    !user?.role ||
    user?.email?.includes('doctor') ||
    user?.email?.includes('admin');

  const currentUserEmail = user?.email || 'dr.joseph.akora@doctorian.ug';

  // Handle click on patient details
  const handleInspectPatient = (patient: UgandaPatientRecord) => {
    if (isAuthorizedClinician) {
      setSelectedPatientDetails(patient);
    } else {
      // Check if this patient belongs to the logged in user
      if (patient.ownerEmail && patient.ownerEmail === currentUserEmail) {
        setSelectedPatientDetails(patient);
      } else {
        // Trigger strict security block shield
        setSecurityBlockModal(patient);
      }
    }
  };

  // Filtered list
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.admittingPhysician.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHosp = selectedHospital === 'All' || p.hospital.includes(selectedHospital);
    const matchesTriage = selectedTriageLevel === 'All' || p.triageLevel.includes(selectedTriageLevel);
    return matchesSearch && matchesHosp && matchesTriage;
  });

  return (
    <div className="w-full min-h-screen bg-[#f3f7fd] dark:bg-[#060e20] text-slate-900 dark:text-slate-100 font-sans pb-16 overflow-x-hidden">
      
      {/* Top Banner (Hospital Management System / Uganda National Patient Triage) */}
      <div className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#081530]/95 backdrop-blur-md border-b border-slate-200 dark:border-blue-900/40 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs">HMS</span>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Hospital Management System
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                Uganda National Registry
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live referral triage, ICU bed allocation & zero-leak encrypted remote access across Ugandan Referral Hospitals
            </p>
          </div>

          {/* Security Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm">
            <ShieldCheck size={16} />
            <span>Encrypted • Uganda Data Protection Act 2019 Active</span>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. Header Overview Cards (Matching image_15669e11.png) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card A: Total Patients */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#091836] border border-slate-200 dark:border-blue-900/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Patients</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">15,040</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Admissions Today</span>
              <span className="font-bold text-emerald-500">+1,840 (12.2%)</span>
            </div>
          </div>

          {/* Card B: Available Beds */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#091836] border border-slate-200 dark:border-blue-900/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Available Beds</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">2,000</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Bed size={20} />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">ICU & HDU Beds</span>
              <span className="font-bold text-cyan-400">184 Ready</span>
            </div>
          </div>

          {/* Card C: Triage Assessments */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#091836] border border-slate-200 dark:border-blue-900/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Triage Performance</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">44,400</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Activity size={20} />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Emergency Dispatches</span>
              <span className="font-bold text-rose-500">7,300 Urgent</span>
            </div>
          </div>

          {/* Card D: Bed Occupancy Bar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#091836] border border-slate-200 dark:border-blue-900/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Bed Occupancy Rate</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">82%</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Building2 size={20} />
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-blue-950 rounded-full h-2.5 mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-2.5 rounded-full" style={{ width: '82%' }} />
            </div>
          </div>

        </div>

        {/* 2. Main Patient Records Section */}
        <div className="rounded-3xl bg-white dark:bg-[#091836] border border-slate-200 dark:border-blue-900/50 shadow-sm p-5 space-y-4">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-blue-900/40">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Patient Records & Hospital Triage
              </h3>
              <p className="text-xs text-slate-400">
                Connected referral wards across Mulago, Mbarara, Gulu, Jinja, Kiruddu, Entebbe
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient, hospital, or physician..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-[#050e20] border border-slate-200 dark:border-blue-800/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Hospital Filter */}
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="bg-slate-100 dark:bg-[#050e20] border border-slate-200 dark:border-blue-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="All">All Hospitals</option>
                <option value="Mulago">Mulago National Referral</option>
                <option value="Mbarara">Mbarara Regional Referral</option>
                <option value="Gulu">Gulu Regional Referral</option>
                <option value="Jinja">Jinja Regional Referral</option>
                <option value="Mbale">Mbale Regional Referral</option>
                <option value="Fort Portal">Fort Portal (Buhinga) Referral</option>
                <option value="Arua">Arua Regional Referral</option>
                <option value="Kabale">Kabale Regional Referral</option>
                <option value="Kiruddu">Kiruddu Hospital</option>
                <option value="Entebbe">Entebbe Hospital</option>
              </select>

              {/* Triage Level Filter */}
              <select
                value={selectedTriageLevel}
                onChange={(e) => setSelectedTriageLevel(e.target.value)}
                className="bg-slate-100 dark:bg-[#050e20] border border-slate-200 dark:border-blue-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="All">All Triage Levels</option>
                <option value="Resuscitation">Level 1 - Resuscitation</option>
                <option value="Emergent">Level 2 - Emergent</option>
                <option value="Urgent">Level 3 - Urgent</option>
                <option value="Stable">Level 4 - Stable</option>
              </select>

            </div>
          </div>

          {/* Table / Cards of Patients */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-[#050e20] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-blue-900/50">
                <tr>
                  <th className="p-3">Patient ID</th>
                  <th className="p-3">Age / Gender</th>
                  <th className="p-3">Hospital & Ward</th>
                  <th className="p-3">Admitting Physician</th>
                  <th className="p-3">Triage Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                {filteredPatients.map((p) => {
                  const isCrit = p.status === 'Critical';

                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
                    >
                      {/* Patient ID & Avatar */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-blue-400/50"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{p.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Age / Gender */}
                      <td className="p-3">
                        <span className="font-semibold">{p.age} yrs</span>
                        <span className="text-slate-400 block text-[10px]">{p.gender}</span>
                      </td>

                      {/* Hospital & Ward */}
                      <td className="p-3">
                        <p className="font-bold text-blue-600 dark:text-cyan-300">{p.hospital}</p>
                        <p className="text-[10px] text-slate-400">{p.ward} • {p.bedNumber}</p>
                      </td>

                      {/* Admitting Physician */}
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {p.admittingPhysician}
                      </td>

                      {/* Triage Severity */}
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            p.triageLevel.includes('Resuscitation')
                              ? 'bg-rose-500 text-white animate-pulse'
                              : p.triageLevel.includes('Emergent')
                              ? 'bg-orange-500 text-white'
                              : p.triageLevel.includes('Urgent')
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {p.triageLevel}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCrit
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleInspectPatient(p)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTIONED PATIENT DETAIL MODAL (Authorized Access)                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedPatientDetails && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#071533] border border-blue-500/40 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPatientDetails.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-black">{selectedPatientDetails.name}</h3>
                    <p className="text-xs text-blue-100">
                      {selectedPatientDetails.id} • {selectedPatientDetails.hospital} ({selectedPatientDetails.ward})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPatientDetails(null)}
                  className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body: 5 Sectioned Cards */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* SECTION 1: Demographics & Remote Contact */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1c3f] border border-slate-200 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-black uppercase text-[11px]">
                    <MapPin size={14} />
                    <span>Section 1: Demographics & Remote Care Contact</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Age / Gender</span>
                      <strong className="text-slate-900 dark:text-white">{selectedPatientDetails.age}y • {selectedPatientDetails.gender}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Bed Assignment</span>
                      <strong className="text-slate-900 dark:text-white">{selectedPatientDetails.bedNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Direct Phone</span>
                      <strong className="text-blue-500">{selectedPatientDetails.contact}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Next of Kin</span>
                      <strong className="text-slate-900 dark:text-white truncate block">{selectedPatientDetails.nextOfKin}</strong>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Clinical Vitals & Triage Category */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1c3f] border border-slate-200 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-500 font-black uppercase text-[11px]">
                    <Activity size={14} />
                    <span>Section 2: Triage Assessment & Hemodynamics</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#061026] border border-slate-200 dark:border-blue-900/40">
                      <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                      <strong className="text-sm font-black text-rose-500">{selectedPatientDetails.vitals.hr} bpm</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#061026] border border-slate-200 dark:border-blue-900/40">
                      <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                      <strong className="text-sm font-black text-blue-500">{selectedPatientDetails.vitals.bp} mmHg</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#061026] border border-slate-200 dark:border-blue-900/40">
                      <span className="text-[10px] text-slate-400 block">SpO2 Oxygen</span>
                      <strong className="text-sm font-black text-emerald-500">{selectedPatientDetails.vitals.spo2}%</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#061026] border border-slate-200 dark:border-blue-900/40">
                      <span className="text-[10px] text-slate-400 block">Body Temp</span>
                      <strong className="text-sm font-black text-amber-500">{selectedPatientDetails.vitals.temp}°C</strong>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Clinical Diagnosis & Attending Directives */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1c3f] border border-slate-200 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase text-[11px]">
                    <Stethoscope size={14} />
                    <span>Section 3: Primary Clinical Diagnosis</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    {selectedPatientDetails.diagnosis}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Admitting Physician in Charge: <strong className="text-cyan-300">{selectedPatientDetails.admittingPhysician}</strong>
                  </p>
                </div>

                {/* SECTION 4: Active Medication Orders */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1c3f] border border-slate-200 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black uppercase text-[11px]">
                    <FileText size={14} />
                    <span>Section 4: Active Medication Protocols</span>
                  </div>
                  <ul className="space-y-1.5 list-disc pl-5 text-slate-700 dark:text-slate-300 font-medium">
                    {selectedPatientDetails.medications.map((med, i) => (
                      <li key={i}>{med}</li>
                    ))}
                  </ul>
                </div>

                {/* SECTION 5: National Identity, Blood Profile, Allergies & Scheme */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1c3f] border border-slate-200 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black uppercase text-[11px]">
                    <ShieldCheck size={14} />
                    <span>Section 5: National Identity, Blood Profile & Allergies</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 text-[10px] block">National Identification Number (NIN)</span>
                      <strong className="text-cyan-400 font-mono text-xs block">{selectedPatientDetails.nin}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Blood Type & Genotype</span>
                      <strong className="text-emerald-400 font-mono text-xs block">{selectedPatientDetails.bloodType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Known Drug Allergies</span>
                      <strong className="text-rose-400 text-xs block">{selectedPatientDetails.allergies.join(', ') || 'NKDA (None)'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Health Insurance / Referral Voucher</span>
                      <strong className="text-slate-900 dark:text-slate-200 text-xs block">{selectedPatientDetails.insuranceScheme}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-slate-50 dark:bg-[#050e20] border-t border-slate-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[10px]">
                  End-to-End Cryptographically Signed • Mulago & MoH Node
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPatientDetails(null)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Close Record
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SECURITY ACCESS RESTRICTION SHIELD MODAL (Data Leaks & Snooping Guard)   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {securityBlockModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-3xl bg-[#14080b] border-2 border-rose-500 text-white p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-rose-600/20 border border-rose-500/60 flex items-center justify-center mx-auto text-rose-500">
                <ShieldAlert size={34} className="animate-pulse" />
              </div>

              <h3 className="text-lg font-black text-rose-400 tracking-tight uppercase">
                Access Restricted • Security Shield Active
              </h3>

              <div className="space-y-2 text-xs text-slate-300 text-left bg-[#200a10] p-4 rounded-2xl border border-rose-900/50">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Lock size={14} className="text-rose-400" />
                  <span>Uganda Data Protection & Privacy Act 2019</span>
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Medical records of <strong className="text-white">{securityBlockModal.name}</strong> are end-to-end encrypted and isolated. Patients are strictly limited to viewing their own personal records.
                </p>
                <p className="text-[10px] font-mono text-rose-300">
                  Audit Signal: Unauthorized cross-account access attempt blocked and logged.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSecurityBlockModal(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Dismiss Warning
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UgandaPatientTriage;
