import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Shield,
  Stethoscope,
  ChevronLeft,
  RefreshCw,
  Share2
} from 'lucide-react';
import { AppointmentScheduler } from './AppointmentScheduler';
import { syncAppointmentToCalendar } from '../utils/googleWorkspace';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'virtual' | 'physical';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export const AppointmentsView: React.FC<{ user: any; onShowToast: (msg: string, type?: string) => void }> = ({ user, onShowToast }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'apt-1',
      doctorName: 'Dr. Akora Joseph',
      specialty: 'Cardiovascular Medicine',
      date: 'Aug 20, 2026',
      time: '10:30 AM',
      type: 'virtual',
      status: 'upcoming',
      notes: 'Neural heart rhythm baseline review and telemetry check.'
    },
    {
      id: 'apt-2',
      doctorName: 'Dr. Sarah Jenkins',
      specialty: 'Clinical Endocrinology',
      date: 'Aug 28, 2026',
      time: '02:00 PM',
      type: 'physical',
      status: 'upcoming',
      notes: 'Genomic biomarker panel and metabolism profiling.'
    },
    {
      id: 'apt-3',
      doctorName: 'Dr. Liam Patel',
      specialty: 'Neurology & Cognitive Core',
      date: 'Aug 05, 2026',
      time: '09:00 AM',
      type: 'virtual',
      status: 'completed',
      notes: 'Brain wave synchronization and offline model diagnostic.'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>({
    id: 'spec-1',
    name: 'Dr. Akora Joseph',
    specialty: 'Cardiovascular Medicine',
    rating: 4.9
  });
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({});

  const handleSyncCalendar = async (apt: Appointment) => {
    setSyncingMap(prev => ({ ...prev, [apt.id]: true }));
    try {
      await syncAppointmentToCalendar({
        summary: `Doctorian Consultation: ${apt.doctorName}`,
        description: `Clinician: ${apt.doctorName} (${apt.specialty})\nNotes: ${apt.notes || 'Routine EHR Telehealth checkup.'}`,
        dateStr: apt.date,
        timeStr: apt.time,
        type: apt.type
      });
      onShowToast(`📅 Synchronized! Session pinned to your Google Calendar.`, 'success');
    } catch (err: any) {
      console.error("Google Calendar Sync Error:", err);
      onShowToast(`Calendar Sync failed. Please authenticate Google credentials.`, 'error');
    } finally {
      setSyncingMap(prev => ({ ...prev, [apt.id]: false }));
    }
  };

  const handleBookAppointment = (details: any) => {
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      doctorName: details.specialist.name,
      specialty: details.specialist.specialty,
      date: details.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: details.slots[0] || '09:00 AM',
      type: details.type,
      status: 'upcoming',
      notes: 'Consultation request from patient health workstation.'
    };
    setAppointments(prev => [newApt, ...prev]);
    setIsSchedulerOpen(false);
    onShowToast(`Successfully scheduled appointment with ${details.specialist.name}!`, 'success');
  };

  const upcomingApts = appointments.filter(a => a.status === 'upcoming');
  const pastApts = appointments.filter(a => a.status !== 'upcoming');

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 box-border min-h-screen">
      <AnimatePresence mode="wait">
        {isSchedulerOpen ? (
          <motion.div
            key="scheduler"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-3xl mx-auto"
          >
            <div className="mb-4">
              <button 
                onClick={() => setIsSchedulerOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Back to appointments</span>
              </button>
            </div>
            <AppointmentScheduler 
              specialist={selectedSpecialist} 
              onClose={() => setIsSchedulerOpen(false)} 
              onConfirm={handleBookAppointment} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-[1000] uppercase tracking-tighter mb-2">Appointments & Consultations</h1>
                  <p className="text-xs sm:text-sm text-blue-100/95 max-w-xl font-medium font-sans">
                    Schedule, monitor, and synchronize with certified medical professionals, telehealth scribes, and autonomous diagnostic agents.
                  </p>
                </div>
                <button
                  onClick={() => setIsSchedulerOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-xl transition-all self-start md:self-auto"
                >
                  <Plus size={16} />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>

            {/* Quick stats and selection tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'upcoming'
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm border border-slate-200/35 dark:border-slate-850/50'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Upcoming ({upcomingApts.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'history'
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm border border-slate-200/35 dark:border-slate-850/50'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Past Records ({pastApts.length})
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <Shield size={12} className="text-blue-500 shrink-0" />
                <span>Secure HIPAA Compliance Active</span>
              </div>
            </div>

            {/* Appointment List rendering */}
            <div className="space-y-4">
              {(activeTab === 'upcoming' ? upcomingApts : pastApts).length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-150 dark:border-slate-800/80 space-y-4">
                  <CalendarIcon size={44} className="mx-auto text-slate-300 dark:text-slate-650 animate-bounce" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">No Appointments Found</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto font-sans leading-relaxed">
                      You do not have any {activeTab} scheduled clinic sessions on this workstation node.
                    </p>
                  </div>
                  {activeTab === 'upcoming' && (
                    <button
                      onClick={() => setIsSchedulerOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      Book Session Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activeTab === 'upcoming' ? upcomingApts : pastApts).map((apt, aptIdx) => (
                    <motion.div
                      key={`apt-card-${apt.id}-${aptIdx}`}
                      whileHover={{ y: -2 }}
                      className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/70 rounded-[2.5rem] p-6 shadow-xs flex flex-col justify-between hover:border-blue-500 transition-all duration-200 relative group"
                    >
                      <div>
                        {/* Upper Details Row */}
                        <div className="flex items-center justify-between mb-4 border-b border-slate-50 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                              <User size={20} />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{apt.doctorName}</h4>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{apt.specialty}</p>
                            </div>
                          </div>

                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                            apt.status === 'upcoming' ? 'bg-blue-500/15 text-blue-600' :
                            apt.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {apt.status}
                          </span>
                        </div>

                        {/* Middle Info Block */}
                        <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100/40 dark:border-slate-800/50">
                          <div className="flex items-center gap-2">
                            <CalendarIcon size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                            <div className="leading-tight">
                              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Date</span>
                              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">{apt.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                            <div className="leading-tight">
                              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Time Slot</span>
                              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">{apt.time}</span>
                            </div>
                          </div>
                        </div>

                        {apt.notes && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed mb-4 p-1">
                            <strong>Workstation Note:</strong> {apt.notes}
                          </p>
                        )}
                      </div>

                      {/* Lower Action bar */}
                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          {apt.type === 'virtual' ? (
                            <>
                              <Video size={12} className="text-blue-500 shrink-0" />
                              <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Virtual Consultation</span>
                            </>
                          ) : (
                            <>
                              <MapPin size={12} className="text-emerald-500 shrink-0" />
                              <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Physical Clinic Visit</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          {apt.status === 'upcoming' && (
                            <button
                              onClick={() => handleSyncCalendar(apt)}
                              disabled={syncingMap[apt.id]}
                              className="text-[9px] font-black uppercase tracking-widest text-blue-650 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                              title="Sync to Google Calendar"
                            >
                              {syncingMap[apt.id] ? (
                                <RefreshCw size={11} className="animate-spin" />
                              ) : (
                                <Share2 size={11} />
                              )}
                              <span>Sync to Calendar</span>
                            </button>
                          )}

                          {apt.status === 'upcoming' && (
                            <button
                              onClick={() => {
                                if (apt.type === 'virtual') {
                                  onShowToast(`Connecting securely to Telehealth Scribe server...`, 'success');
                                } else {
                                  onShowToast(`Directions sent to connected GPS module.`, 'info');
                                }
                              }}
                              className="text-[9px] font-black uppercase tracking-widest text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>{apt.type === 'virtual' ? 'Join Call' : 'Directions'}</span>
                              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
