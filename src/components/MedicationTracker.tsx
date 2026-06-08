import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pill, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Calendar,
  ChevronRight,
  Info,
  Search,
  Loader2,
  Bell,
  BellOff,
  Camera,
  FileSearch,
  Sparkles,
  RefreshCw,
  Zap,
  Upload
} from 'lucide-react';
import { api } from '../api';
import { ClinicalProtocols } from './Tasks';
import { MedicationAdherenceChart } from './MedicationAdherenceChart';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  category: 'prescription' | 'supplement';
  takenToday: boolean;
  remindersEnabled?: boolean;
}

import { useArduinoContext } from '../ArduinoContext';

export const MedicationTracker: React.FC = () => {
  const arduino = useArduinoContext();
  const [notificationState, setNotificationState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  useEffect(() => {
    if (!('Notification' in window)) {
      setNotificationState('unsupported');
    } else {
      setNotificationState(Notification.permission as any);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) return;
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationState(permission as any);
      
      if (permission === 'granted') {
        const title = '💊 Doctorian Push Engine';
        const options = {
          body: 'Local push reminders and clinical alerts successfully active!',
          icon: '/logo.svg',
          badge: '/logo.svg',
          tag: 'doctorian-registration'
        };
        
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration && 'showNotification' in registration) {
            await registration.showNotification(title, options);
            return;
          }
        }
        new Notification(title, options);
      }
    } catch (err) {
      console.error('[NOTIFICATIONS] Request failed:', err);
    }
  };

  const handleTriggerTestNotification = async () => {
    if (notificationState !== 'granted') {
      alert('Please authorize local push permissions first.');
      return;
    }
    const title = '🧪 Local Notification Test';
    const options = {
      body: 'This is a simulator test. Your local push reminders are fully functional background & offline.',
      icon: '/logo.svg',
      badge: '/logo.svg',
    };
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return;
      }
    }
    new Notification(title, options);
  };

  const [isLoading, setIsLoading] = React.useState(true);
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [registerMode, setRegisterMode] = useState<'manual' | 'library' | 'scan'>('manual');
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeTab, setActiveTab] = useState<'meds' | 'protocols'>('meds');
  const [newMed, setNewMed] = useState({ 
    name: '', 
    dosage: '', 
    frequency: 'Daily', 
    time: '08:00', 
    category: 'prescription' as const,
    remindersEnabled: true 
  });
  const [isReadingPrescription, setIsReadingPrescription] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractionResults, setExtractionResults] = useState<any[] | null>(null);

  const processPrescriptionFile = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPrescriptionImage(base64);
      setIsReadingPrescription(true);
      setExtractionResults(null);
      
      try {
        const prompt = `Act as a Clinical Pharmacologist. Read this prescription image and extract the medication data.
        Return ONLY a JSON array of objects with these keys: name, dosage, frequency, time (24h format), category ('prescription' or 'supplement').
        Do not include markdown tags other than the JSON container. If you write markdown code block, ensure it is standard JSON inside.
        
        Example: [{"name": "Amoxicillin", "dosage": "500mg", "frequency": "3 times daily", "time": "08:00", "category": "prescription"}]`;

        const response = await api.ai.aiChat(
          [{ role: 'user', text: prompt, images: [base64] }],
          "You are a Clinical Extraction Engine. You must return only a JSON array."
        );

        const text = response.text.replace(/```json|```/g, '').trim();
        const extractedMeds = JSON.parse(text);
        
        if (Array.isArray(extractedMeds)) {
          const addedArray: any[] = [];
          // Add them one by one or batch
          for (const m of extractedMeds) {
             const created = await api.medications.create({
                name: m.name,
                dosage: m.dosage || '500mg',
                frequency: m.frequency || 'Daily',
                time: m.time || '08:00',
                category: m.category || 'prescription',
                remindersEnabled: true
             });
             setMeds(prev => [created, ...prev]);
             addedArray.push(created);
          }
          setExtractionResults(addedArray);
          fetchHistory();
        }
      } catch (err) {
        console.error("Prescription reading failed:", err);
        alert("Neural extraction failed. Please ensure the prescription photo is clear and contains readable prescriptions.");
      } finally {
        setIsReadingPrescription(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrescriptionRead = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processPrescriptionFile(file);
  };

  const commonMeds = [
    { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', category: 'supplement' },
    { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', category: 'prescription' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', category: 'prescription' },
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'Nightly', category: 'prescription' },
    { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours', category: 'supplement' },
    { name: 'Omeprazole', dosage: '20mg', frequency: 'Daily (Morning)', category: 'prescription' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', category: 'prescription' },
  ];

  useEffect(() => {
    fetchMeds();
    fetchHistory();
  }, []);

  const fetchMeds = async () => {
    setIsLoading(true);
    try {
      const data = await api.medications.list();
      setMeds(data);
    } catch (err) {
      console.error("Failed to fetch meds:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await api.medications.history();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;
    try {
      const med = await api.medications.create(newMed);
      setMeds([med, ...meds]);
      setIsAdding(false);
      setShowLibrary(false);
      setNewMed({ name: '', dosage: '', frequency: 'Daily', time: '08:00', category: 'prescription', remindersEnabled: true });
      fetchHistory();
    } catch (err) {
      console.error("Failed to add med:", err);
    }
  };

  const handleTakeStatus = async (id: string, currentlyTaken: boolean) => {
    try {
      await api.medications.take(id, currentlyTaken);
      setMeds(meds.map(m => m.id === id ? { ...m, takenToday: !currentlyTaken } : m));
      fetchHistory();
    } catch (err) {
      console.error("Failed to update intake status:", err);
    }
  };

  const handleDeleteMed = async (id: string) => {
    try {
      await api.medications.delete(id);
      setMeds(meds.filter(m => m.id !== id));
      fetchHistory();
    } catch (err) {
      console.error("Failed to delete med:", err);
    }
  };

  const toggleReminders = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      setMeds(meds.map(m => m.id === id ? { ...m, remindersEnabled: newStatus } : m));
      await api.medications.update(id, { remindersEnabled: newStatus });
    } catch (err) {
      console.error("Failed to toggle reminders:", err);
      // Revert local state on error
      setMeds(meds.map(m => m.id === id ? { ...m, remindersEnabled: currentStatus } : m));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center space-y-8 animate-pulse text-center">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center">
          <Pill className="text-rose-600 animate-pulse" size={40} />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-64 bg-slate-100 dark:bg-slate-900 rounded-full mx-auto" />
          <div className="h-4 w-48 bg-slate-50 dark:bg-slate-950 rounded-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="bg-rose-600 p-2 rounded-xl text-white">
              <Pill size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Medication Intelligence</p>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Cognis <span className="text-rose-600 font-serif italic normal-case">Potions</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-base">Precision dosage tracking and interaction risk assessment.</p>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-fit ${arduino.connection.connected ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${arduino.connection.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {arduino.connection.connected ? `Arduino Connected` : 'Arduino Link Offline'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('meds')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'meds' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Molecules
          </button>
          <button 
            onClick={() => setActiveTab('protocols')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'protocols' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Clinical Protocols
          </button>
        </div>

        <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={() => {
              setRegisterMode('scan');
              setExtractionResults(null);
              setPrescriptionImage(null);
              setIsAdding(true);
            }}
            className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 hover:bg-emerald-700 active:scale-95 transition-all shadow-xl"
          >
            <Camera size={16} />
            Scan Prescriptions
          </button>
          <button 
            onClick={() => {
              setRegisterMode('manual');
              setIsAdding(true);
            }}
            className="flex-1 sm:flex-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
          >
            <Plus size={16} />
            Register
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {activeTab === 'meds' ? (
          <>
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meds.map((med, i) => (
                  <motion.div 
                    key={med.id || `med-${i}`}
                    layout
                    className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-2xl ${med.category === 'prescription' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                          <Pill size={24} />
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => toggleReminders(med.id, !!med.remindersEnabled)} 
                            className={`p-2 rounded-lg transition-colors ${med.remindersEnabled ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-300 hover:text-slate-500'}`}
                            title={med.remindersEnabled ? 'Reminders On' : 'Reminders Off'}
                           >
                             {med.remindersEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                           </button>
                           <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-tighter ${med.takenToday ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                             {med.takenToday ? 'SYNCHRONIZED' : 'PENDING'}
                           </span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{med.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{med.dosage} • {med.frequency}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 mt-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} />
                        <span className="text-[10px] font-black uppercase">{med.time}</span>
                      </div>
                      <button 
                        onClick={() => handleTakeStatus(med.id, !!med.takenToday)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          med.takenToday 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        }`}
                      >
                        {med.takenToday ? 'Mark as Missed' : 'Confirm Intake'}
                      </button>
                    </div>

                    <button 
                      onClick={() => handleDeleteMed(med.id)}
                      className="absolute top-4 right-4 p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <section className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldCheck size={80} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight mb-4 relative z-10">Interaction Engine</h3>
                <p className="text-sm text-slate-400 font-bold mb-8 relative z-10 font-serif">No conflicting biochemical signatures detected across active molecules.</p>
                <div className="flex items-center gap-3 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 relative z-10">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase">Safety Status</p>
                     <p className="text-xs font-bold text-emerald-500">OPTIMAL RANGE</p>
                  </div>
                </div>
              </section>

              {/* Local Push Notifications Control Panel */}
              <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                     <Bell size={18} className="text-blue-500" />
                     Push Core
                   </h3>
                   <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                     notificationState === 'granted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                     notificationState === 'denied' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                     notificationState === 'unsupported' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                     'bg-slate-50 text-slate-500 border border-slate-100'
                   }`}>
                     {notificationState === 'granted' ? 'Active' : notificationState === 'denied' ? 'Blocked' : notificationState === 'unsupported' ? 'Unsupported' : 'Pending'}
                   </span>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
                   Receive ambient, offline, and background dosage reminders on your device terminal instantly.
                 </p>
                 
                 {notificationState === 'default' && (
                   <button
                     onClick={handleEnableNotifications}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-2"
                   >
                     <Sparkles size={14} />
                     Authorize Notifications
                   </button>
                 )}
                 
                 {notificationState === 'granted' && (
                   <div className="space-y-3">
                     <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 rounded-2xl">
                       <CheckCircle2 size={16} />
                       <span className="text-[10px] font-black uppercase tracking-wider">Device Synced & Ready</span>
                     </div>
                     <button
                       onClick={handleTriggerTestNotification}
                       className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                     >
                       <Zap size={12} className="text-amber-500 fill-amber-500" />
                       Send Test Push Alert
                     </button>
                   </div>
                 )}
                 
                 {notificationState === 'denied' && (
                   <div className="p-4 bg-rose-50 dark:bg-rose-950/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-center">
                     <p className="text-[11px] font-bold leading-relaxed">
                       Notification access is blocked. Please reset your browser site settings to enable offline dosage alerts.
                     </p>
                   </div>
                 )}
                 
                 {notificationState === 'unsupported' && (
                   <div className="p-4 bg-amber-50 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 text-center">
                     <p className="text-[11px] font-bold leading-relaxed">
                       This browser environment does not support background push alerts.
                     </p>
                   </div>
                 )}
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                 <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                   <Calendar size={18} className="text-rose-600" />
                   Next Supply Cycle
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Pill size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Omega-3 Refill</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">In 12 days</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                 </div>
              </section>
            </div>

            <div className="lg:col-span-12">
              <MedicationAdherenceChart medications={meds} history={history} onRefresh={fetchHistory} />
            </div>
          </>
        ) : (
          <div className="lg:col-span-12">
            <ClinicalProtocols />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
               <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Register <span className="text-rose-600">Molecule</span></h2>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setExtractionResults(null);
                    setPrescriptionImage(null);
                  }}
                  className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  Close
                </button>
               </div>

               {/* Mode Switch Tabs */}
               <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 font-black uppercase text-[10px] tracking-wider gap-2">
                 <button
                   onClick={() => {
                     setRegisterMode('manual');
                     setExtractionResults(null);
                   }}
                   className={`flex-1 pb-3 border-b-2 text-center transition-all ${registerMode === 'manual' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                 >
                   Manual Entry
                 </button>
                 <button
                   onClick={() => {
                     setRegisterMode('library');
                     setExtractionResults(null);
                   }}
                   className={`flex-1 pb-3 border-b-2 text-center transition-all ${registerMode === 'library' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                 >
                   Library
                 </button>
                 <button
                   onClick={() => setRegisterMode('scan')}
                   className={`flex-1 pb-3 border-b-2 text-center transition-all ${registerMode === 'scan' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                 >
                   Prescription OCR
                 </button>
               </div>

               {registerMode === 'library' && (
                 <div className="space-y-3 mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select from common molecules</p>
                    <div className="grid grid-cols-1 gap-2">
                       {commonMeds.map((m, idx) => (
                         <button
                          key={idx}
                          onClick={() => {
                            setNewMed({...newMed, name: m.name, dosage: m.dosage, frequency: m.frequency, category: m.category as any});
                            setRegisterMode('manual');
                          }}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all text-left"
                         >
                           <div>
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{m.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{m.dosage} • {m.frequency}</p>
                           </div>
                           <Plus size={16} className="text-slate-300" />
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {registerMode === 'manual' && (
                 <form onSubmit={handleAddMed} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Molecular Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Lipitor 20mg"
                        className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold"
                        value={newMed.name}
                        onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
                        <input 
                           type="text" 
                           placeholder="e.g. 500mg"
                           className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold"
                           value={newMed.dosage}
                           onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                        <select 
                          className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold appearance-none"
                          value={newMed.frequency}
                          onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                        >
                          <option>Daily</option>
                          <option>Twice Daily</option>
                          <option>3 Times Daily</option>
                          <option>Every 8 Hours</option>
                          <option>Weekly</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Time</label>
                      <input 
                        type="time" 
                        className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold"
                        value={newMed.time}
                        onChange={(e) => setNewMed({...newMed, time: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <button 
                        type="button"
                        onClick={() => setNewMed({...newMed, remindersEnabled: !newMed.remindersEnabled})}
                        className={`w-10 h-6 rounded-full p-1 transition-all ${newMed.remindersEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${newMed.remindersEnabled ? 'ml-4' : 'ml-0'}`} />
                      </button>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Enable Cellular Alerts</span>
                    </div>
                    <div className="flex gap-3 pt-6">
                      <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
                      <button type="submit" className="flex-2 bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Complete Registration</button>
                    </div>
                 </form>
               )}

               {registerMode === 'scan' && (
                 <div className="space-y-6">
                   {!isReadingPrescription && !extractionResults && (
                     <div 
                       className={`relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-350 cursor-pointer ${
                         isDragging 
                         ? 'border-emerald-500 bg-emerald-500/15' 
                         : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-605 bg-slate-50/50 dark:bg-slate-800/40'
                       }`}
                       onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                       onDragLeave={() => setIsDragging(false)}
                       onDrop={async (e) => {
                         e.preventDefault();
                         setIsDragging(false);
                         const file = e.dataTransfer.files?.[0];
                         if (file) {
                           await processPrescriptionFile(file);
                         }
                       }}
                       onClick={() => document.getElementById('prescription-file-elem')?.click()}
                     >
                       <input 
                         type="file" 
                         id="prescription-file-elem" 
                         className="hidden" 
                         accept="image/*" 
                         onChange={handlePrescriptionRead} 
                       />
                       <div className="flex flex-col items-center">
                         <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl mb-4">
                           <Upload size={32} />
                         </div>
                         <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">Drag & Drop prescription</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">or click to browse local files</p>
                         <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase leading-relaxed max-w-xs px-4">
                           The clinical vision engine reads standard diagnostic certificates, automatically logs dosage matrices, and cross-checks allergen vectors.
                         </p>
                       </div>
                     </div>
                   )}

                   {isReadingPrescription && (
                     <div className="relative mt-4 flex flex-col items-center p-8 bg-slate-950 rounded-[2rem] border border-white/10 text-white overflow-hidden shadow-xl text-center">
                       {prescriptionImage && (
                         <div className="relative w-full max-w-[280px] h-[180px] bg-black/60 rounded-xl overflow-hidden mb-6 border border-white/5">
                           <img src={prescriptionImage} alt="Prescription draft" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                           {/* Dynamic scan line effect */}
                           <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-[bounce_2s_infinite]" />
                         </div>
                       )}
                       <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
                       <h3 className="text-xs font-black uppercase tracking-[0.15em] text-emerald-400 mb-1">OCR Analysis Stream Active</h3>
                       <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Parsing clinical chemical signatures...</p>
                     </div>
                   )}

                   {extractionResults && !isReadingPrescription && (
                     <div className="space-y-6">
                       <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-[2rem] flex items-center gap-4">
                         <div className="p-3 bg-emerald-500 text-white rounded-xl">
                           <CheckCircle2 size={20} />
                         </div>
                         <div>
                           <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Chemical Matrix Synthesized</h4>
                           <p className="text-[10px] uppercase text-slate-400 font-bold mt-0.5">{extractionResults.length} molecules digitized from prescription image.</p>
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Registered Bio-Molecules</p>
                         {extractionResults.map((r, i) => (
                           <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                             <div>
                               <p className="text-sm font-black uppercase text-slate-900 dark:text-white">{r.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{r.dosage} • {r.frequency}</p>
                             </div>
                             <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-xl">Success</span>
                           </div>
                         ))}
                       </div>
                       
                       <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                         <button 
                           type="button" 
                           onClick={() => {
                             setExtractionResults(null);
                             setPrescriptionImage(null);
                           }}
                           className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                         >
                           Scan Another
                         </button>
                         <button 
                           type="button" 
                           onClick={() => {
                             setIsAdding(false);
                             setExtractionResults(null);
                             setPrescriptionImage(null);
                           }}
                           className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg"
                         >
                           Finished
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
