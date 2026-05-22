import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Star, Calendar, MessageSquare, Phone, ShieldCheck, Stethoscope, Heart, Brain, Bone, Eye, Zap, X, User as UserIcon, Loader2 } from 'lucide-react';
import { AppointmentScheduler } from './AppointmentScheduler';
import { api, Doctor } from '../api';

export const SpecialistFinder: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingSpecialist, setBookingSpecialist] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'network'>('grid');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Link Doctor', 'Cardiologist', 'Dentist', 'Surgeon', 'Therapist'];

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

  const filtered = doctors.filter(s => 
    (activeCategory === 'All' || s.specialization.toLowerCase().includes(activeCategory.toLowerCase())) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.specialization.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleWhatsApp = (whatsappNumber: string) => {
    // Ensure the number is formatted without + for the URL
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-12 pb-24 px-4 sm:px-6 relative">
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
      <header className="flex flex-col gap-6 sm:gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-[1000] text-slate-900 dark:text-white tracking-[-0.05em] uppercase leading-none mb-4">
              Link <span className="text-blue-600">Doctors</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-xl leading-relaxed">
              Connect directly with registered specialists in your area via WhatsApp.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
             <div className="flex w-full sm:w-auto bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Grid
                </button>
                <button 
                  onClick={() => setViewMode('network')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'network' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Network
                </button>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <MapPin size={20} />
               </div>
               <div className="text-left">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Region</p>
                 <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase">Your Location</p>
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-[2rem] py-4 sm:py-6 pl-14 sm:pl-16 pr-6 text-sm sm:text-base font-bold shadow-2xl shadow-slate-100 dark:shadow-none focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
          
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar py-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-[1.5rem] text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Fast Lane Header */}
      <div className="bg-slate-950 rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Zap size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Zap size={16} className="fill-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Direct Link</span>
            </div>
            <h2 className="text-2xl sm:text-6xl font-[1000] mb-4 sm:mb-6 tracking-tighter uppercase leading-[0.9]">Direct <span className="text-blue-500">WhatsApp</span> Interaction</h2>
            <p className="text-slate-400 font-bold text-base sm:text-lg leading-relaxed">
              No more waiting in lines. Chat directly with registered specialists via WhatsApp and schedule your consultations instantly.
            </p>
          </div>
          {doctors.length > 0 && (
            <button 
              onClick={() => handleWhatsApp(doctors[0].whatsappNumber)}
              className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-white text-slate-950 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap shadow-xl"
            >
               Chat Now
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Synchronizing Directory...</p>
        </div>
      ) : viewMode === 'network' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 rounded-[3rem] p-12 border border-slate-800 shadow-2xl relative overflow-hidden h-[600px] flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 opacity-20">
             <svg className="w-full h-full" viewBox="0 0 1000 500">
                <path d="M100,250 Q250,100 400,250 T700,250 T900,250" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="5,5" />
                <path d="M150,100 Q350,400 550,100 T850,100" fill="none" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="2,10" />
                {[...Array(20)].map((_, i) => (
                   <circle key={i} cx={Math.random() * 1000} cy={Math.random() * 500} r={Math.random() * 3} fill="#2563eb" className="animate-pulse" />
                ))}
             </svg>
          </div>
          <div className="relative z-10 text-center max-w-2xl">
             <h3 className="text-4xl font-[1000] uppercase tracking-tighter mb-4">Doctor <span className="text-blue-500">Directory Grid</span></h3>
             <p className="text-slate-400 font-bold mb-12">Visualizing medical nodes across the region. All physicians listed are verified Link Doctors.</p>
             
             <div className="flex justify-center gap-8">
                {[
                  { label: 'Registered', val: doctors.length },
                  { label: 'Active Region', val: 'Kampala' },
                  { label: 'Verified', val: '100%' }
                ].map((s, i) => (
                  <div key={i}>
                     <p className="text-3xl font-black">{s.val}</p>
                     <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
             </div>
          </div>
        </motion.div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length > 0 ? filtered.map((doctor) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-2xl relative overflow-hidden">
                    {doctor.imageUrl ? (
                      <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="text-blue-600" />
                    )}
                    <div className="absolute -right-1 -top-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-lg font-black text-[8px] flex items-center justify-center">
                      <ShieldCheck size={10} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 dark:text-white">{doctor.name}</h3>
                    </div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                    VERIFIED
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <MapPin size={14} className="text-slate-400" /> {doctor.location}
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Phone size={14} className="text-slate-400" /> WhatsApp Direct Link
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleWhatsApp(doctor.whatsappNumber)} 
                  className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  <MessageSquare size={18} /> CHAT ON WHATSAPP
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center">
               <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No Link Doctors match your search criteria.</p>
            </div>
          )}
        </section>
      )}

      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <ShieldCheck size={16} /> Link Doctors Verified
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Are you a medical specialist?</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Join the Link Doctors network to provide immediate care to patients in your area. Contact the administrator for registration.
            </p>
          </div>
          <button 
            className="bg-white text-slate-900 px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-slate-50 transition-all shadow-xl active:scale-95 whitespace-nowrap"
          >
            CONTACT ADMIN
          </button>
        </div>
      </section>
    </div>
  );
};
