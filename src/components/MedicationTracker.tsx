import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pill,
  Calendar,
  Clock,
  Stethoscope,
  Phone,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  Download,
  Eye,
  Printer,
  Share2,
  CalendarPlus,
  Info,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Video,
  Shield,
  Cloud,
  Globe,
  Heart,
  Bell,
  Settings,
  X,
  FileText,
  User,
  ExternalLink
} from 'lucide-react';

export interface MedicationTrackerProps {
  user?: any;
  onNavigate?: (view: any) => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface PrescriptionItem {
  id: number;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: 'Active' | 'Completed' | 'Pending';
  instructions: string;
  category: string;
  prescribedBy: string;
}

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  user,
  onNavigate = () => {},
  addToast = () => {}
}) => {
  // Prescriptions list matching the reference image exactly
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 1,
      medicine: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Every 6 Hours',
      duration: '7 Days',
      status: 'Active',
      instructions: 'Take 1 tablet after meals with water as needed for fever or mild pain.',
      category: 'Analgesic & Antipyretic',
      prescribedBy: 'Dr. Sarah M. Nakitto'
    },
    {
      id: 2,
      medicine: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Every 8 Hours',
      duration: '10 Days',
      status: 'Active',
      instructions: 'Take 1 capsule every 8 hours with water after food. Complete the full course.',
      category: 'Antibiotic (Penicillin class)',
      prescribedBy: 'Dr. Sarah M. Nakitto'
    },
    {
      id: 3,
      medicine: 'Vitamin C',
      dosage: '1000mg',
      frequency: 'Once Daily',
      duration: '30 Days',
      status: 'Active',
      instructions: 'Take 1 tablet in the morning with breakfast for immune resilience.',
      category: 'Nutritional Supplement',
      prescribedBy: 'Dr. Sarah M. Nakitto'
    }
  ]);

  // Schedule list matching image
  const [schedule, setSchedule] = useState([
    { id: 'sc-1', time: '08:00 AM', med: 'Paracetamol 500mg', status: 'Taken' },
    { id: 'sc-2', time: '08:00 PM', med: 'Amoxicillin 500mg', status: 'Due Soon' },
    { id: 'sc-3', time: 'Next Day 08:00 AM', med: 'Vitamin C 1000mg', status: 'Pending' }
  ]);

  // Smart Reminders toggle
  const [remindersActive, setRemindersActive] = useState(true);

  // Modals state
  const [selectedMed, setSelectedMed] = useState<PrescriptionItem | null>(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [scheduleDay, setScheduleDay] = useState('Today');
  const [isScheduleDayMenuOpen, setIsScheduleDayMenuOpen] = useState(false);

  // Toggle dose taken status
  const toggleDose = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'Taken' ? 'Pending' : 'Taken';
          addToast(`Marked ${item.med} as ${nextStatus}`, 'success');
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Toggle reminders
  const handleToggleReminders = () => {
    const next = !remindersActive;
    setRemindersActive(next);
    addToast(next ? 'Smart Medication Reminders enabled' : 'Smart Reminders paused', 'info');
  };

  // Action handlers
  const handleDownloadPrescription = (medName?: string) => {
    addToast(`Downloading digital prescription for ${medName || 'All Medications'} (PDF)...`, 'info');
    setTimeout(() => {
      addToast('Prescription PDF successfully saved to device', 'success');
    }, 900);
  };

  const handlePrintPrescription = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-4 sm:space-y-5 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* 1. HERO BANNER: Smart Remote Prescription (Exact match to image) */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-r from-[#00388d] via-[#025ecb] to-[#00b0ff]">
        {/* Crisp cropped banner image asset */}
        <img
          src="/rx_hero_banner.png"
          alt="Smart Remote Prescription - Get, manage and follow your prescription from anywhere, anytime."
          className="w-full h-auto min-h-[140px] max-h-[260px] object-cover block"
          onError={(e) => {
            // High fidelity fallback banner if image load falls back
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback accessible overlay content if needed */}
        <div className="sr-only">
          <h1>Smart Remote Prescription</h1>
          <p>Get, manage and follow your prescription from anywhere, anytime.</p>
          <span>Your Health • Our Priority</span>
        </div>
      </div>

      {/* 2. TOP THREE CARDS: Patient Name, Next Medication, Your Doctor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Card 1: Patient Name */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex items-center gap-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-950/60 p-0.5 overflow-hidden shrink-0 border-2 border-white dark:border-slate-800 shadow-2xs flex items-center justify-center">
            <img
              src="/rx_patient_avatar.png"
              alt="Akora Joseph"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/african_doctor_male.png';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block tracking-tight">
              Patient Name
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white truncate leading-tight">
              Akora Joseph
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
              Patient ID: DAI-2026-1187
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              Age: 22 • Gender: Male
            </p>
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/50">
                <Check size={12} className="stroke-[3]" />
                Active Patient
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Next Medication */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex items-center gap-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Calendar size={28} className="stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block tracking-tight">
              Next Medication
            </span>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                Today at 8:00 PM
              </h3>
              <span className="text-amber-500 text-sm">🔔</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
              Take 1 Capsule of Amoxicillin
            </p>
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/50">
                <Check size={12} className="stroke-[3]" />
                On Schedule
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Your Doctor */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Stethoscope size={28} className="stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block tracking-tight">
              Your Doctor
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate leading-tight">
              Dr. Sarah M. Nakitto
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
              General Physician
            </p>
            <button
              type="button"
              onClick={() => setIsDoctorModalOpen(true)}
              className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Phone size={11} className="fill-current" />
              <span>Contact Doctor</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsDoctorModalOpen(true)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
            aria-label="Doctor profile details"
          >
            <ChevronRight size={18} />
          </button>
        </div>

      </div>

      {/* 3. YOUR PRESCRIPTIONS TABLE CARD (Dark Blue Header Bar) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
        {/* Header Bar */}
        <div className="bg-[#0b387e] dark:bg-blue-950 px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Pill size={18} className="rotate-45" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Your Prescriptions
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              addToast('Displaying all 3 active verified prescriptions', 'info');
            }}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white hover:bg-blue-50 text-[#0b387e] font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>View All Prescriptions</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-blue-50/70 dark:bg-slate-800/60 border-b border-blue-100 dark:border-slate-800 text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Medicine</th>
                <th className="py-3 px-4">Dosage</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100/70 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200">
              {prescriptions.map((rx) => (
                <tr
                  key={rx.id}
                  className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500 dark:text-slate-400">
                    {rx.id}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                    {rx.medicine}
                  </td>
                  <td className="py-3.5 px-4">
                    {rx.dosage}
                  </td>
                  <td className="py-3.5 px-4">
                    {rx.frequency}
                  </td>
                  <td className="py-3.5 px-4">
                    {rx.duration}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMed(rx)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 text-sky-700 dark:text-sky-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPrescription(rx.medicine)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. THIRD ROW: Medication Schedule, Smart Reminders, Prescription Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Card 1: Medication Schedule */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Medication Schedule
                </h3>
              </div>

              {/* Day dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsScheduleDayMenuOpen(!isScheduleDayMenuOpen)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <span>{scheduleDay}</span>
                  <ChevronDown size={13} />
                </button>
                {isScheduleDayMenuOpen && (
                  <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-20">
                    {['Today', 'Tomorrow', 'This Week'].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setScheduleDay(day);
                          setIsScheduleDayMenuOpen(false);
                          addToast(`Switched schedule view to ${day}`, 'info');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800"
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Schedule List */}
            <div className="space-y-3">
              {/* Item 1 */}
              <div
                onClick={() => toggleDose('sc-1')}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-blue-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      08:00 AM
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold ml-2">
                      Paracetamol 500mg
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Taken ✓
                </span>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => toggleDose('sc-2')}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-blue-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <Clock size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      08:00 PM
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold ml-2">
                      Amoxicillin 500mg
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-2xs">
                  Due Soon
                </span>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => toggleDose('sc-3')}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/20 hover:bg-blue-50/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Next Day 08:00 AM
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-2">
                      Vitamin C 1000mg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Smart Reminders */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Smart Reminders
                </h3>
              </div>

              {/* iOS style toggle */}
              <button
                type="button"
                onClick={handleToggleReminders}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  remindersActive ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle Smart Reminders"
              >
                <motion.div
                  layout
                  className="bg-white w-4 h-4 rounded-full shadow-md"
                  animate={{ x: remindersActive ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Reminders List */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => addToast('Medication Reminders set for 08:00 AM & 08:00 PM', 'info')}
                className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Medication Reminder
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Get notified on time
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => addToast('Refill alert set: Automatic notice when 3 doses remain', 'info')}
                className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Refill Reminder
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      When stock is low
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                    <CalendarPlus size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Follow-up Reminder
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Your next check-up
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Prescription Actions */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Settings size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Prescription Actions
              </h3>
            </div>

            {/* 4 Colorful Action Tiles (Exact match to image colors & icons) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Tile 1: Green Download */}
              <button
                type="button"
                onClick={() => handleDownloadPrescription()}
                className="rounded-2xl bg-[#cbf4c9] dark:bg-emerald-950/80 border border-emerald-300/40 p-3 flex flex-col items-center justify-center text-center gap-1.5 hover:scale-[1.03] transition-transform cursor-pointer shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                  <Download size={18} className="stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-black text-emerald-900 dark:text-emerald-200 leading-tight">
                  Download<br />Prescription
                </span>
              </button>

              {/* Tile 2: Purple Print */}
              <button
                type="button"
                onClick={handlePrintPrescription}
                className="rounded-2xl bg-[#e6d8ff] dark:bg-purple-950/80 border border-purple-300/40 p-3 flex flex-col items-center justify-center text-center gap-1.5 hover:scale-[1.03] transition-transform cursor-pointer shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-300 flex items-center justify-center">
                  <Printer size={18} className="stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-black text-purple-950 dark:text-purple-200 leading-tight">
                  Print<br />Prescription
                </span>
              </button>

              {/* Tile 3: Orange Share */}
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="rounded-2xl bg-[#ffd9b3] dark:bg-amber-950/80 border border-amber-300/40 p-3 flex flex-col items-center justify-center text-center gap-1.5 hover:scale-[1.03] transition-transform cursor-pointer shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white/70 dark:bg-amber-900/60 text-orange-800 dark:text-orange-300 flex items-center justify-center">
                  <Share2 size={18} className="stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-black text-orange-950 dark:text-orange-200 leading-tight">
                  Share<br />with Doctor
                </span>
              </button>

              {/* Tile 4: Teal Book Follow-up */}
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="rounded-2xl bg-[#ccf5f2] dark:bg-teal-950/80 border border-teal-300/40 p-3 flex flex-col items-center justify-center text-center gap-1.5 hover:scale-[1.03] transition-transform cursor-pointer shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white/70 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                  <CalendarPlus size={18} className="stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-black text-teal-950 dark:text-teal-200 leading-tight">
                  Book<br />Follow-up
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 5. FOURTH ROW: Medicine Info, Health Tools, Your Health Insights, Telemedicine */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Medicine Information */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Info size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Medicine Information
              </h3>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="w-16 h-14 rounded-2xl bg-sky-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-sky-100 dark:border-slate-700">
                <img
                  src="/rx_capsule_3d.png"
                  alt="Amoxicillin 500mg capsule"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  Amoxicillin
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  500mg • Capsule
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-2">
              Take 1 Capsule every 8 Hours with water after food.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMed(prescriptions[1])}
            className="inline-flex items-center gap-1 text-xs font-black text-blue-600 dark:text-blue-400 hover:underline mt-3 cursor-pointer"
          >
            <span>View Details</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Card 2: Health Tools */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Heart size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Health Tools
              </h3>
            </div>

            {/* 2x2 Tools Grid (Exact match to image colors & icons) */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* Tool 1: Drug Interaction Checker */}
              <button
                type="button"
                onClick={() => setActiveToolModal('interaction')}
                className="rounded-2xl bg-[#dff0ff] dark:bg-blue-950/80 border border-blue-200/50 p-2.5 flex flex-col items-center justify-center text-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-[10px] font-black text-blue-950 dark:text-blue-200 leading-tight">
                  Drug Interaction<br />Checker
                </span>
              </button>

              {/* Tool 2: Side Effects Info */}
              <button
                type="button"
                onClick={() => setActiveToolModal('side_effects')}
                className="rounded-2xl bg-[#ffeedd] dark:bg-amber-950/80 border border-amber-200/50 p-2.5 flex flex-col items-center justify-center text-center gap-1 hover:bg-orange-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <span className="text-[10px] font-black text-amber-950 dark:text-amber-200 leading-tight">
                  Side Effects<br />Info
                </span>
              </button>

              {/* Tool 3: Medicine Tracker */}
              <button
                type="button"
                onClick={() => setActiveToolModal('tracker')}
                className="rounded-2xl bg-[#e0f7f7] dark:bg-teal-950/80 border border-teal-200/50 p-2.5 flex flex-col items-center justify-center text-center gap-1 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500 text-white flex items-center justify-center">
                  <BarChart3 size={16} />
                </div>
                <span className="text-[10px] font-black text-teal-950 dark:text-teal-200 leading-tight">
                  Medicine<br />Tracker
                </span>
              </button>

              {/* Tool 4: Health Tips */}
              <button
                type="button"
                onClick={() => setActiveToolModal('tips')}
                className="rounded-2xl bg-[#fff7d6] dark:bg-yellow-950/80 border border-yellow-200/50 p-2.5 flex flex-col items-center justify-center text-center gap-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/60 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-white flex items-center justify-center">
                  <Lightbulb size={16} />
                </div>
                <span className="text-[10px] font-black text-amber-950 dark:text-amber-200 leading-tight">
                  Health<br />Tips
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Your Health Insights */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <BarChart3 size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Your Health Insights
              </h3>
            </div>

            <div className="space-y-3 mt-2">
              {/* Adherence Gauge */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      Medication Adherence
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      95%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[95%]" />
                </div>
              </div>

              {/* Health Status */}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={14} className="stroke-[3]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Health Status
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    Good
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveToolModal('report')}
            className="inline-flex items-center gap-1 text-xs font-black text-blue-600 dark:text-blue-400 hover:underline mt-3 cursor-pointer"
          >
            <span>View Health Report</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Card 4: Telemedicine */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-2xs relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Video size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Telemedicine
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pr-16 sm:pr-0">
              Talk to your doctor via video call or chat.
            </p>

            <div className="flex justify-end mt-1">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-sky-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-sm">
                <img
                  src="/rx_doctor_telemed.png"
                  alt="Doctorian Video Telemedicine Physician"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/african_doctor_male.png';
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('specialist');
              }
              setIsDoctorModalOpen(true);
            }}
            className="w-full py-2 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer mt-2"
          >
            <Video size={14} />
            <span>Start Video Call</span>
          </button>
        </div>

      </div>

      {/* 6. BOTTOM TRUST & BENEFITS BANNER */}
      <div className="rounded-3xl bg-blue-50/80 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* 4 Feature Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto flex-1">
          {/* Badge 1 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                Safe &amp; Secure
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Your data is protected
              </p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Cloud size={20} />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                Access Anywhere
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                On any device
              </p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Globe size={20} />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                Multilingual
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                In your language
              </p>
            </div>
          </div>

          {/* Badge 4 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Heart size={20} />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                Better Health
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live a healthier life
              </p>
            </div>
          </div>
        </div>

        {/* Right CTA Pill Button */}
        <button
          type="button"
          onClick={() => {
            addToast('Doctorian AI Tele-Pharmacy connected • 24/7 Support Active', 'success');
          }}
          className="px-5 py-2.5 rounded-full bg-[#0a2f6b] hover:bg-[#07224f] text-white text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Heart size={14} className="fill-current text-sky-400" />
          <span>Stay healthy. Stay connected.</span>
        </button>

      </div>

      {/* 7. INTERACTIVE MODALS */}
      
      {/* Modal 1: Medication View Details */}
      <AnimatePresence>
        {selectedMed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                    <Pill size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedMed.medicine} ({selectedMed.dosage})
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">
                      Prescription Spec • {selectedMed.category}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMed(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-slate-400 font-bold block">Frequency</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">{selectedMed.frequency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Course Duration</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">{selectedMed.duration}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-400 font-bold block">Prescribing Clinician</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">{selectedMed.prescribedBy}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-400 font-bold block">Verification Status</span>
                    <span className="font-black text-emerald-600">● Uganda MoH Active</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-1">Clinical Instructions:</h4>
                  <p className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 leading-relaxed font-medium">
                    {selectedMed.instructions}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDownloadPrescription(selectedMed.medicine)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMed(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Contact Doctor Modal */}
      <AnimatePresence>
        {isDoctorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Dr. Sarah M. Nakitto
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      General Physician • Mulago Hospital
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  Connect with Dr. Nakitto regarding your current prescription dosage, refill verification, or adjustments.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToast('Initiating encrypted tele-consult call...', 'info');
                      setIsDoctorModalOpen(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Phone size={15} />
                    <span>Direct Audio Call (+256 700 123 456)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addToast('Launching Doctorian HD Video Room...', 'success');
                      setIsDoctorModalOpen(false);
                      if (onNavigate) onNavigate('specialist');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Video size={15} />
                    <span>Start Telemedicine Video Call</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Tool Modals (Interactions, Side Effects, Health Tips) */}
      <AnimatePresence>
        {activeToolModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {activeToolModal === 'interaction' && <ShieldCheck className="text-blue-600" size={18} />}
                  {activeToolModal === 'side_effects' && <AlertTriangle className="text-amber-500" size={18} />}
                  {activeToolModal === 'tracker' && <BarChart3 className="text-teal-600" size={18} />}
                  {activeToolModal === 'tips' && <Lightbulb className="text-amber-400" size={18} />}
                  {activeToolModal === 'report' && <FileText className="text-blue-600" size={18} />}
                  <span>
                    {activeToolModal === 'interaction' && 'Drug Interaction Checker'}
                    {activeToolModal === 'side_effects' && 'Side Effects Safety Matrix'}
                    {activeToolModal === 'tracker' && 'Medicine Adherence Tracker'}
                    {activeToolModal === 'tips' && 'Pharmacological Health Tips'}
                    {activeToolModal === 'report' && 'Clinical Prescription Report'}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveToolModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs space-y-2.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeToolModal === 'interaction' && (
                  <>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Zero contraindications detected between Paracetamol, Amoxicillin, and Vitamin C.
                    </p>
                    <p>
                      The current combination follows the Uganda Essential Medicines List (EMLU) guidelines. No adverse hepatic or renal interference identified.
                    </p>
                  </>
                )}
                {activeToolModal === 'side_effects' && (
                  <>
                    <p>
                      <strong>Amoxicillin:</strong> Mild nausea or gastrointestinal sensitivity. Always take with meals and ample hydration.
                    </p>
                    <p>
                      <strong>Paracetamol:</strong> Safe within 500mg - 1000mg dosage intervals. Do not exceed 4g in 24 hours.
                    </p>
                  </>
                )}
                {activeToolModal === 'tracker' && (
                  <>
                    <p>
                      You have maintained a <strong>95% adherence rating</strong> over the past 30 days.
                    </p>
                    <p>
                      Consistently taking doses at the prescribed 8:00 AM and 8:00 PM intervals ensures optimum therapeutic plasma concentrations.
                    </p>
                  </>
                )}
                {activeToolModal === 'tips' && (
                  <>
                    <p>
                      • Finish your complete 10-day antibiotic sequence even if fever symptoms subside early.
                    </p>
                    <p>
                      • Drink at least 2 liters of safe clean water daily while taking oral antimicrobials.
                    </p>
                  </>
                )}
                {activeToolModal === 'report' && (
                  <>
                    <p>
                      <strong>Patient:</strong> Akora Joseph (DAI-2026-1187)
                    </p>
                    <p>
                      <strong>Regimen:</strong> 3 verified molecules • 0 adverse interaction alerts • Full adherence verified.
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveToolModal(null)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Book Follow-up */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarPlus className="text-teal-600" size={18} />
                  <span>Book Clinical Follow-up</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  Select a follow-up review slot with Dr. Sarah M. Nakitto following your 10-day Amoxicillin course:
                </p>

                <div className="space-y-2">
                  {['Friday, Nov 14 • 10:00 AM', 'Saturday, Nov 15 • 02:30 PM', 'Monday, Nov 17 • 09:00 AM'].map((slot, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => {
                        addToast(`Follow-up confirmed for ${slot}`, 'success');
                        setIsBookingModalOpen(false);
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-teal-50/60 dark:bg-slate-800/60 hover:bg-teal-100 border border-teal-200/60 dark:border-slate-700 font-bold text-slate-800 dark:text-white transition-colors cursor-pointer"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 5: Share with Doctor */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="text-orange-500" size={18} />
                  <span>Share Prescription Slip</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  Generate an encrypted 256-bit clinical link to share your active prescription record directly with licensed pharmacies or medical consultants:
                </p>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] select-all break-all text-slate-700 dark:text-slate-300">
                  https://doctorian.ai/rx/verify?id=DAI-2026-1187-AKORA
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('https://doctorian.ai/rx/verify?id=DAI-2026-1187-AKORA');
                      addToast('Encrypted prescription link copied to clipboard!', 'success');
                      setIsShareModalOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer text-center"
                  >
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MedicationTracker;
