import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Star, Calendar, MessageSquare, Phone, ShieldCheck, 
  Stethoscope, ShieldAlert, Zap, User as UserIcon, Loader2, Clock
} from 'lucide-react';
import { AppointmentScheduler } from './AppointmentScheduler';
import { api, Doctor } from '../api';

export const SpecialistFinder: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingSpecialist, setBookingSpecialist] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Link Doctor', 'Cardiologist', 'Dentist', 'Surgeon', 'Therapist'];

  // Load specialists from active directory API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await api.doctors.listActive();
        setDoctors(data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Trigger standard whatsapp direct message
  const handleWhatsAppBase = (whatsappNumber: string) => {
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  // Categorize specialists loaded from API
  const filteredSpecialists = doctors.filter(s => 
    (activeCategory === 'All' || s.specialization.toLowerCase().includes(activeCategory.toLowerCase())) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.specialization.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 sm:space-y-12 pb-24 px-4 sm:px-6 relative">
      
      {/* Appointment Scheduler Dialog */}
      <AnimatePresence>
        {bookingSpecialist && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 md:p-12 overflow-hidden"
          >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setBookingSpecialist(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl h-[95%] sm:h-full flex flex-col pointer-events-auto"
            >
              <AppointmentScheduler 
                specialist={bookingSpecialist} 
                onClose={() => setBookingSpecialist(null)}
                onConfirm={(appt) => {
                  const saved = localStorage.getItem('doctorian_appointments');
                  const current = saved ? JSON.parse(saved) : [];
                  const newAppt = { ...appt, id: Math.random().toString(36).substr(2, 9) };
                  localStorage.setItem('doctorian_appointments', JSON.stringify([...current, newAppt]));
                  window.dispatchEvent(new Event('storage'));
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Title Header Section */}
      <header className="flex flex-col gap-6 sm:gap-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-[1000] text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">Secure Clinic Channels</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Specialists Core</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-[1000] text-slate-900 dark:text-white tracking-[-0.05em] uppercase leading-none mb-4">
              Link <span className="text-blue-600">Specialists</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-xl leading-relaxed">
              Find, consult, and book verified medical professionals and clinics instantly across the region.
            </p>
          </div>
        </div>
      </header>

      {/* ----------------- REGISTERED SPECIALISTS DIRECTORY ----------------- */}
      <div className="space-y-8 animate-fade-in">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Verified Partners', value: doctors.length, desc: 'Registered active consultants', icon: <ShieldCheck className="text-blue-500" /> },
            { label: 'Fast consults', value: 'Instant', desc: 'No hospital queuing waitlists', icon: <Clock className="text-amber-500" /> },
            { label: 'Routing nodes', value: 'Kampala Node', desc: 'Active communication relays', icon: <MapPin className="text-emerald-500" /> },
            { label: 'Secure protocol', value: 'AES-256', desc: 'End-to-end telemetry vault', icon: <ShieldCheck className="text-violet-500" /> }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">{stat.label}</span>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">{stat.icon}</div>
              </div>
              <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase leading-none mb-1">{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Search Controls Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search registered specialists directory..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl py-4 sm:py-5 pl-14 sm:pl-16 pr-6 text-sm font-bold shadow focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
          
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar py-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3.5 rounded-2xl text-[9px] whitespace-nowrap font-[1000] uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10' 
                    : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Fast Lane Header Banner */}
        <div className="bg-slate-950 rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 text-white relative overflow-hidden group border border-slate-800 shadow-xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Zap size={200} className="text-blue-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Zap size={16} className="fill-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Direct Doctor Connection</span>
              </div>
              <h2 className="text-2xl sm:text-5xl font-[1000] mb-4 sm:mb-6 tracking-tighter uppercase leading-[0.9]">Direct <span className="text-blue-500">WhatsApp</span> consult channel</h2>
              <p className="text-slate-400 font-bold text-sm sm:text-base leading-relaxed">
                Avoid long clinic waitlists. Instantly connect with verified specialists via customized secure WhatsApp links, or lock-in appointments on our scheduler.
              </p>
            </div>
            {doctors.length > 0 && (
              <button 
                onClick={() => handleWhatsAppBase(doctors[0].whatsappNumber)}
                className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 rounded-2xl font-[1000] text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap shadow-xl"
              >
                 Direct Consult
              </button>
            )}
          </div>
        </div>

        {/* Specialists Roster Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={40} className="animate-spin text-blue-600" />
            <p className="text-xs font-black text-slate-405 uppercase tracking-widest">Synchronizing directory roster...</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecialists.length > 0 ? filteredSpecialists.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-2xl relative overflow-hidden">
                        {doctor.imageUrl ? (
                          <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon className="text-blue-600 w-8 h-8" />
                        )}
                        <div className="absolute -right-0.5 -top-0.5 bg-emerald-500 text-white p-1 rounded-full border border-white dark:border-slate-900 shadow font-black text-[8px]">
                          <ShieldCheck size={8} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{doctor.name}</h3>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mt-1">{doctor.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-wider border border-emerald-100 dark:border-emerald-900">
                      VERIFIED
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <MapPin size={12} className="text-slate-400" /> {doctor.location}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <Phone size={12} className="text-slate-400" /> Secure Contact Routing
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button 
                    onClick={() => handleWhatsAppBase(doctor.whatsappNumber)} 
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-[1000] text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
                  >
                    <MessageSquare size={14} /> WhatsApp
                  </button>
                  <button 
                    onClick={() => setBookingSpecialist({
                      id: doctor.id,
                      name: doctor.name,
                      specialty: doctor.specialization,
                      image: doctor.imageUrl,
                      rating: 5
                    })} 
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-[1000] text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
                  >
                    <Calendar size={14} /> Book Slot
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center">
                 <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No verified specialists match your query criteria.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
