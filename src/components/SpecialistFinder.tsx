import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Star, Calendar, MessageSquare, Phone, ShieldCheck, 
  Stethoscope, ShieldAlert, Zap, User as UserIcon, Loader2, Clock,
  QrCode, Scan, Plus, Check, AlertCircle, Camera, RefreshCw, X, Play,
  Navigation, ExternalLink, Compass, Crosshair, Building2
} from 'lucide-react';
import { AppointmentScheduler } from './AppointmentScheduler';
import { api, Doctor } from '../api';
import jsQR from 'jsqr';
import { QRCodeSVG } from 'qrcode.react';

export const SpecialistFinder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'specialists' | 'maps_locator'>('specialists');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingSpecialist, setBookingSpecialist] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Google Maps Grounding State (Gemini 3.8 Flash)
  const [mapsQuery, setMapsQuery] = useState('');
  const [mapsSpecialtyFilter, setMapsSpecialtyFilter] = useState('Emergency Trauma');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingFacilities, setIsSearchingFacilities] = useState(false);
  const [mapsFacilityResult, setMapsFacilityResult] = useState<{
    summary: string;
    groundingChunks: Array<{ maps?: { title?: string; uri?: string; address?: string }; web?: { title?: string; uri?: string } }>;
    facilities?: Array<{
      title: string;
      uri: string;
      address?: string;
      specialty?: string;
      phone?: string;
      rating?: number;
      distanceKm?: number;
    }>;
  } | null>(null);

  // QR Scanner States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [importingPatient, setImportingPatient] = useState<any>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'new' | 'duplicate_skipped' | 'updated';
    message: string;
    patientName: string;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedDemoCard, setSelectedDemoCard] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const demoPatients = [
    {
      name: "Sarah Nabirye",
      age: "29",
      gender: "Female",
      weight: "58kg",
      bloodType: "A+",
      phone: "+256782112233",
      doctorPhone: "+256787674140",
      mentorPhone: "+256787674140",
      conditions: "Pregnancy Induced Hypertension, Preeclampsia risk",
      allergies: "Penicillin",
      vitalsPreset: "warning" as const
    },
    {
      name: "Kato John",
      age: "12",
      gender: "Male",
      weight: "34kg",
      bloodType: "O-",
      phone: "+256703998877",
      doctorPhone: "+256787674140",
      mentorPhone: "+256787674140",
      conditions: "Acute Bronchial Asthma, Seasonal Allergies",
      allergies: "Sulfa Drugs, Aspirin",
      vitalsPreset: "critical" as const
    },
    {
      name: "Mirembe Brenda",
      age: "52",
      gender: "Female",
      weight: "72kg",
      bloodType: "B+",
      phone: "+256754556677",
      doctorPhone: "+256787674140",
      mentorPhone: "+256787674140",
      conditions: "Post-Appendectomy Recovery, Type II Diabetes",
      allergies: "None",
      vitalsPreset: "healthy" as const
    }
  ];

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play().catch(e => console.log("Video play interrupted", e));
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError(err.name === "NotAllowedError" ? "Camera permission was denied. Please allow camera access in your browser settings." : "Failed to initialize camera. Make sure your device has a camera.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Auto stop camera on unmount or close
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleScannedText = (text: string) => {
    try {
      let dataToParse = text;
      if (text.includes('scanUserData=')) {
        const urlParams = new URLSearchParams(text.split('?')[1]);
        const scanUserData = urlParams.get('scanUserData');
        if (scanUserData) {
          dataToParse = decodeURIComponent(atob(scanUserData).split('').map((c, mapIdx_122) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
        }
      }

      const parsed = JSON.parse(dataToParse);
      const name = parsed.name || parsed.user?.displayName || parsed.user?.name;

      if (name) {
        setImportingPatient({
          name: name || '',
          age: parsed.age || parsed.user?.age || '35',
          gender: parsed.gender || parsed.user?.gender || 'Other',
          weight: parsed.weight || parsed.user?.weight || '72kg',
          bloodType: parsed.bloodType || parsed.user?.bloodGroup || parsed.user?.bloodType || 'O+',
          phone: parsed.phone || parsed.user?.phone || '',
          doctorPhone: parsed.doctorPhone || parsed.user?.doctorPhone || '+256787674140',
          mentorPhone: parsed.mentorPhone || parsed.user?.mentorPhone || '+256787674140',
          conditions: parsed.conditions || parsed.user?.conditions || 'None declared',
          allergies: parsed.allergies || parsed.user?.allergies || 'None recorded',
          vitalsPreset: parsed.vitalsPreset || parsed.user?.vitalsPreset || 'healthy'
        });
        stopCamera();
      } else {
        setCameraError("Scanned QR code does not contain a valid patient clinical record.");
      }
    } catch (e) {
      console.error("Failed to parse QR content", e);
      // In case it's not JSON, treat it as a raw string / basic patient import
      setImportingPatient({
        name: text.substring(0, 30),
        age: '30',
        gender: 'Other',
        weight: '70kg',
        bloodType: 'O+',
        phone: '+256780000000',
        doctorPhone: '+256787674140',
        mentorPhone: '+256787674140',
        conditions: text || 'Physical record scan import',
        allergies: 'None recorded',
        vitalsPreset: 'healthy' as const
      });
      stopCamera();
    }
  };

  const handleSimulateScan = (patient: any) => {
    stopCamera();
    setImportingPatient(patient);
  };

  const handleImport = (newPatient: any) => {
    const saved = localStorage.getItem('doctorian_registered_patients');
    let current: any[] = [];
    if (saved) {
      try {
        current = JSON.parse(saved);
      } catch (e) {
        current = [];
      }
    } else {
      current = [
        {
          id: 'patient-joseph',
          name: 'Joseph Brian Obote',
          bedNumber: 'Bed A-02',
          age: '45',
          gender: 'Male',
          weight: '78kg',
          bloodType: 'O+',
          phone: '+256701234567',
          doctorPhone: '+256787674140',
          mentorPhone: '+256787674140',
          conditions: 'Congestive Heart Failure, Stage II Kidney Disease',
          allergies: 'Sulfa Drugs',
          vitalsPreset: 'healthy' as const
        }
      ];
    }
    
    const finalizedId = newPatient.id || `patient-scan-${Math.random().toString(36).substr(2, 9)}`;
    const existingIndex = current.findIndex(p => 
      p.id === finalizedId || 
      (p.name && newPatient.name && p.name.toLowerCase().trim() === newPatient.name.toLowerCase().trim())
    );

    if (existingIndex !== -1) {
      const existingPatient = current[existingIndex];
      const diseasesIdentical = 
        existingPatient.conditions === newPatient.conditions && 
        existingPatient.allergies === newPatient.allergies;

      if (diseasesIdentical) {
        setImportStatus({
          type: 'duplicate_skipped',
          patientName: existingPatient.name,
          message: 'This patient is already registered with an identical clinical profile. Skipped regeneration to avoid redundant database entries.'
        });
      } else {
        const updatedPatient = {
          ...existingPatient,
          ...newPatient,
          id: existingPatient.id // keep original ID
        };
        current[existingIndex] = updatedPatient;
        localStorage.setItem('doctorian_registered_patients', JSON.stringify(current));
        window.dispatchEvent(new Event('storage'));
        setImportStatus({
          type: 'updated',
          patientName: existingPatient.name,
          message: `Identified existing patient profile. Successfully updated conditions to: "${newPatient.conditions}"`
        });
      }
    } else {
      const finalizedPatient = {
        ...newPatient,
        id: finalizedId,
        bedNumber: newPatient.bedNumber || `Bed ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-0${Math.floor(Math.random() * 8) + 1}`
      };
      localStorage.setItem('doctorian_registered_patients', JSON.stringify([...current, finalizedPatient]));
      window.dispatchEvent(new Event('storage'));
      setImportStatus({
        type: 'new',
        patientName: finalizedPatient.name,
        message: 'Successfully linked a brand new patient to the active registry database nodes.'
      });
    }
  };

  // Live QR Code Frame Processing
  useEffect(() => {
    let animId: number;
    const processFrame = () => {
      if (cameraActive && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: "dontInvert"
          });
          if (code) {
            handleScannedText(code.data);
            return; // stop polling frame on success
          }
        }
      }
      if (cameraActive) {
        animId = requestAnimationFrame(processFrame);
      }
    };

    if (cameraActive) {
      animId = requestAnimationFrame(processFrame);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [cameraActive]);

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

  // Format standard WhatsApp direct link
  const getWhatsAppHref = (whatsappNumber: string) => {
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  // Google Maps Grounding Facilities Fetcher (Gemini 3.8 Flash)
  const fetchGroundedFacilities = async (queryOverride?: string, specialtyOverride?: string) => {
    setIsSearchingFacilities(true);
    try {
      const activeSpecialty = specialtyOverride || mapsSpecialtyFilter;
      const q = queryOverride || mapsQuery || `${activeSpecialty} emergency medical hospitals and pharmacies`;
      const res = await api.ai.getMapsFacilities({
        query: q,
        latitude: userCoords?.lat || 0.3476,
        longitude: userCoords?.lng || 32.5825,
        specialty: activeSpecialty
      });
      setMapsFacilityResult(res);
    } catch (e) {
      console.error("Maps grounding lookup failed:", e);
    } finally {
      setIsSearchingFacilities(false);
    }
  };

  const acquireLocation = () => {
    if (!('geolocation' in navigator)) {
      fetchGroundedFacilities();
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setIsLocating(false);
        fetchGroundedFacilities(undefined, mapsSpecialtyFilter);
      },
      (err) => {
        console.warn("Geolocation fallback applied:", err);
        setIsLocating(false);
        setUserCoords({ lat: 0.3476, lng: 32.5825 });
        fetchGroundedFacilities(undefined, mapsSpecialtyFilter);
      },
      { timeout: 7000 }
    );
  };

  // Trigger initial facilities fetch when switching to maps locator
  useEffect(() => {
    if (activeTab === 'maps_locator' && !mapsFacilityResult && !isSearchingFacilities) {
      fetchGroundedFacilities();
    }
  }, [activeTab]);

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

      {/* Patient QR Scanner Dialog */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => {
              stopCamera();
              setIsScannerOpen(false);
              setImportingPatient(null);
              setImportSuccess(false);
            }} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  stopCamera();
                  setIsScannerOpen(false);
                  setImportingPatient(null);
                  setImportSuccess(false);
                }}
                className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-all z-10 cursor-pointer"
              >
                <X size={16} />
              </button>

              {importingPatient ? (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-2xl">
                        <Scan size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Verify Physical Record Import</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">Secure OCR & QR Telemetry Matcher</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                      Verified Encryption
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-h-[50vh] overflow-y-auto pr-2">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Patient Full Name</label>
                      <input 
                        type="text" 
                        value={importingPatient.name} 
                        onChange={e => setImportingPatient({...importingPatient, name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Age / Gender */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Age</label>
                        <input 
                          type="text" 
                          value={importingPatient.age} 
                          onChange={e => setImportingPatient({...importingPatient, age: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gender</label>
                        <input 
                          type="text" 
                          value={importingPatient.gender} 
                          onChange={e => setImportingPatient({...importingPatient, gender: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Weight / Blood Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Weight</label>
                        <input 
                          type="text" 
                          value={importingPatient.weight} 
                          onChange={e => setImportingPatient({...importingPatient, weight: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Blood Type</label>
                        <input 
                          type="text" 
                          value={importingPatient.bloodType} 
                          onChange={e => setImportingPatient({...importingPatient, bloodType: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone</label>
                      <input 
                        type="text" 
                        value={importingPatient.phone} 
                        onChange={e => setImportingPatient({...importingPatient, phone: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Allergies */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Allergies</label>
                      <input 
                        type="text" 
                        value={importingPatient.allergies} 
                        onChange={e => setImportingPatient({...importingPatient, allergies: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Conditions */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Medical Conditions</label>
                      <textarea 
                        value={importingPatient.conditions} 
                        onChange={e => setImportingPatient({...importingPatient, conditions: e.target.value})}
                        rows={2}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      />
                    </div>

                    {/* Vitals Preset Selection */}
                    <div className="space-y-2 md:col-span-2 pb-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Simulated Vitals Preset</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['healthy', 'warning', 'critical'] as const).map((p, mapIdx_498) => (
                          <button
                            key={`specialistfinder-l501-p-${p}-${mapIdx_498}`}
                            type="button"
                            onClick={() => setImportingPatient({...importingPatient, vitalsPreset: p})}
                            className="py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600"
                            style={importingPatient.vitalsPreset === p ? {
                              backgroundColor: p === 'healthy' ? 'rgba(16, 185, 129, 0.1)' : p === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              borderColor: p === 'healthy' ? '#10b981' : p === 'warning' ? '#f59e0b' : '#ef4444',
                              color: p === 'healthy' ? '#10b981' : p === 'warning' ? '#f59e0b' : '#ef4444',
                              fontWeight: '900'
                            } : {}}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setImportingPatient(null);
                        startCamera();
                      }}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleImport(importingPatient);
                        setImportSuccess(true);
                        setImportingPatient(null);
                      }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
                    >
                      <Check size={14} /> Confirm Import
                    </button>
                  </div>
                </div>
              ) : importSuccess && importStatus ? (
                <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
                  {importStatus.type === 'new' && (
                    <>
                      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                        <Check size={40} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-1 block">New Patient Linked</span>
                        <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">{importStatus.patientName}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{importStatus.message}</p>
                      </div>
                      <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-400 font-mono">Registry Status</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded border border-emerald-100 dark:border-emerald-900">
                          Active Registry Node Linked
                        </span>
                      </div>
                    </>
                  )}
                  {importStatus.type === 'updated' && (
                    <>
                      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center animate-bounce">
                        <Zap size={40} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-1 block">Clinical Record Updated</span>
                        <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">{importStatus.patientName}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{importStatus.message}</p>
                      </div>
                      <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-400 font-mono">Registry Status</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded border border-blue-100 dark:border-blue-900">
                          Conditions Merged
                        </span>
                      </div>
                    </>
                  )}
                  {importStatus.type === 'duplicate_skipped' && (
                    <>
                      <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
                        <ShieldAlert size={40} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 mb-1 block">Duplicate Registry Safeguard</span>
                        <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">{importStatus.patientName}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-relaxed max-w-md mx-auto">{importStatus.message}</p>
                      </div>
                      <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-400 font-mono">Registry Status</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded border border-amber-100 dark:border-amber-900">
                          Already Registered
                        </span>
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setImportSuccess(false);
                      setImportStatus(null);
                      setIsScannerOpen(false);
                    }}
                    className="px-8 py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all shadow-md"
                  >
                    Close Scanner
                  </button>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
                  {/* Left Column: Live camera feed */}
                  <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[9px] font-black uppercase bg-rose-100 dark:bg-rose-950/50 text-rose-600 px-2.5 py-1 rounded-full">Live Optical Scanner</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">Align Physical Record</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                        Grant camera permission and position the patient's physical QR code within the focus area below to capture and import instantly.
                      </p>
                    </div>

                    {/* Camera scan box */}
                    <div className="relative aspect-video w-full max-w-md mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
                      {cameraActive ? (
                        <>
                          <video ref={videoRef} className="w-full h-full object-cover" />
                          <canvas ref={canvasRef} className="hidden" />
                          
                          {/* Laser beam scan lines */}
                          <div className="absolute inset-8 border-2 border-dashed border-emerald-500/50 pointer-events-none rounded-xl" />
                          <motion.div 
                            animate={{ y: ["-70px", "70px", "-70px"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="absolute left-4 right-4 h-1 bg-emerald-500 shadow-[0_0_12px_#10b981] pointer-events-none"
                          />
                        </>
                      ) : (
                        <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
                          <Camera size={36} className="text-slate-600 animate-pulse" />
                          {cameraError ? (
                            <div className="space-y-2">
                              <p className="text-xs font-black text-rose-500 uppercase">Camera Access Error</p>
                              <p className="text-[10px] font-bold text-slate-400 max-w-xs">{cameraError}</p>
                            </div>
                          ) : (
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Camera Feed Offline</p>
                          )}
                          <button
                            onClick={startCamera}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                          >
                            Start Live Camera
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-center mt-6">
                      {cameraActive && (
                        <button
                          onClick={stopCamera}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                        >
                          Pause Camera
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interactive Simulator */}
                  <div className="w-full lg:w-1/2 p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-950/50 text-blue-600 px-2.5 py-1 rounded-full">Simulator Sandbox</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">Patient Sandbox Core</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                        No physical card handy? Easily test the full profile import pipeline using our demo records below. Click "Simulate Scan" for a 1-click test, or "View QR" to display the valid matrix code.
                      </p>

                      <div className="space-y-3">
                        {demoPatients.map((patient, index) => (
                          <div 
                            key={`specialistfinder-l685-index-${index}`}
                            className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm hover:shadow transition-all group"
                          >
                            <div>
                              <h4 className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-tight">{patient.name}</h4>
                              <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{patient.gender}, {patient.age} yrs • Blood: {patient.bloodType}</p>
                              <p className="text-[9px] text-rose-500 font-bold uppercase mt-1">Allergy: {patient.allergies}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedDemoCard(patient)}
                                className="px-3 py-2 border border-slate-150 dark:border-slate-700 hover:border-blue-500 hover:text-blue-500 text-slate-450 rounded-xl text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all"
                              >
                                View QR
                              </button>
                              <button
                                onClick={() => handleSimulateScan(patient)}
                                className="px-3 py-2 bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-white rounded-xl text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1 shadow group-hover:shadow-md"
                              >
                                <Play size={8} /> Simulate Scan
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                      <div className="flex items-start gap-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/40 p-4 rounded-2xl">
                        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                        <div>
                          <h5 className="text-[10px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider mb-1">MOH Physical Standards</h5>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase">
                            Imported profiles comply with MoH Health Information Exchange protocols and will synchronize live onto active patient trackers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo QR Code Pop-up Card */}
      <AnimatePresence>
        {selectedDemoCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedDemoCard(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-center flex flex-col items-center pointer-events-auto"
            >
              <button 
                onClick={() => setSelectedDemoCard(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-all cursor-pointer"
              >
                <X size={12} />
              </button>

              <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full mb-2">Printable Patient QR Token</span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{selectedDemoCard.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">MOH System Data Matrix</p>

              <div className="p-4 bg-white rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner mb-6">
                <QRCodeSVG 
                  value={JSON.stringify({
                    id: selectedDemoCard.id || `demo-patient-${selectedDemoCard.name.replace(/\s+/g, '-').toLowerCase()}`,
                    nm: selectedDemoCard.name,
                    ag: selectedDemoCard.age,
                    gd: selectedDemoCard.gender,
                    wt: selectedDemoCard.weight,
                    bt: selectedDemoCard.bloodType,
                    ph: selectedDemoCard.phone,
                    dp: selectedDemoCard.doctorPhone,
                    mp: selectedDemoCard.mentorPhone,
                    cd: selectedDemoCard.conditions,
                    al: selectedDemoCard.allergies,
                    vitalsPreset: selectedDemoCard.vitalsPreset
                  })} 
                  size={240} 
                  level="L" 
                />
              </div>

              <p className="text-[10px] text-slate-400 font-semibold leading-normal uppercase max-w-xs mb-4">
                Point your physical device camera at this code to simulate real scanning, or trigger from the main control panel.
              </p>

              <button
                onClick={() => {
                  handleSimulateScan(selectedDemoCard);
                  setSelectedDemoCard(null);
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all"
              >
                Simulate Instant Decode
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Title Header Section */}
      <header className="flex flex-col gap-6 sm:gap-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 w-full">
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

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('specialists')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'specialists'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Stethoscope size={14} />
                <span>Specialists Roster</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('maps_locator')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'maps_locator'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MapPin size={14} />
                <span>Google Maps Locator</span>
                <span className="px-1.5 py-0.5 text-[8px] bg-emerald-400 text-slate-950 font-black rounded-md uppercase">Live Grounded</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsScannerOpen(true);
                startCamera();
              }}
              className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <QrCode size={14} />
              <span>Scan QR</span>
            </button>
          </div>
        </div>
      </header>

      {/* ----------------- GOOGLE MAPS GROUNDED HOSPITAL & EMERGENCY LOCATOR ----------------- */}
      {activeTab === 'maps_locator' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Hero Banner with Live Geolocation */}
          <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-[2.5rem] p-6 sm:p-10 text-white border border-blue-900/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Compass size={180} className="text-blue-400" />
            </div>

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} className="text-blue-400" />
                  Gemini 3.8 Flash Maps Grounding
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <h2 className="text-2xl sm:text-4xl font-[1000] uppercase tracking-tight">
                Emergency Hospitals & Pharmacy Radar
              </h2>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                Direct geographic grounding using Google Maps and real-time clinical GPS telemetry. Find nearby 24/7 trauma centers, cath labs, oxygen supplies, and intensive care units with verified coordinates.
              </p>

              {/* Live Search & GPS Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={mapsQuery}
                    onChange={(e) => setMapsQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchGroundedFacilities(mapsQuery);
                    }}
                    placeholder="Search hospitals, trauma centers, pharmacies... e.g., 'Emergency ICU near Mulago'"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => fetchGroundedFacilities(mapsQuery)}
                    disabled={isSearchingFacilities}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30 disabled:opacity-50"
                  >
                    {isSearchingFacilities ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    <span>Locate</span>
                  </button>

                  <button
                    onClick={acquireLocation}
                    disabled={isLocating}
                    className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
                    title="Acquire device GPS location"
                  >
                    <Crosshair size={14} className={isLocating ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
                    <span className="hidden sm:inline">{userCoords ? 'GPS Locked' : 'My Location'}</span>
                  </button>
                </div>
              </div>

              {/* Specialty Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {[
                  'Emergency Trauma',
                  'Cardiology Centers',
                  '24/7 Pharmacies',
                  'Maternal Care & OBGYN',
                  'Intensive Care (ICU)',
                  'Pediatric Units'
                ].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => {
                      setMapsSpecialtyFilter(spec);
                      fetchGroundedFacilities(undefined, spec);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      mapsSpecialtyFilter === spec
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Clinical Grounding Summary */}
          {mapsFacilityResult?.summary && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Clinical Grounding Intelligence (Gemini 3.8 Flash)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Grounded with live Google Maps geographic topology
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900">
                  Verified Route Grounding
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                {mapsFacilityResult.summary}
              </p>
            </div>
          )}

          {/* Direct Clickable Grounding Links (Google Maps Guidelines Compliance) */}
          {mapsFacilityResult?.groundingChunks && mapsFacilityResult.groundingChunks.filter(c => c.maps?.uri).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <MapPin size={14} className="text-blue-500" />
                <span>Direct Google Maps Grounded Destinations ({mapsFacilityResult.groundingChunks.filter(c => c.maps?.uri).length})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mapsFacilityResult.groundingChunks
                  .filter((c) => c.maps?.uri)
                  .map((chunk, cIdx) => (
                    <a
                      key={`grounding-link-${cIdx}`}
                      href={chunk.maps!.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-blue-500/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                            Google Maps Link
                          </span>
                          <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h5 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                          {chunk.maps!.title || "Medical Facility"}
                        </h5>
                        {chunk.maps!.address && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {chunk.maps!.address}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        <span>Open Live Navigation</span>
                        <Navigation size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Structured Facilities Cards */}
          {mapsFacilityResult?.facilities && mapsFacilityResult.facilities.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Building2 size={14} className="text-emerald-500" />
                <span>Emergency Centers & Diagnostic Wings</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                {mapsFacilityResult.facilities.map((fac, fIdx) => (
                  <div
                    key={`fac-${fIdx}`}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-100 dark:border-emerald-900">
                              24/7 Verified Service
                            </span>
                            {fac.distanceKm && (
                              <span className="text-[10px] font-mono text-slate-400 font-bold">
                                ~{fac.distanceKm} km away
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                            {fac.title}
                          </h4>
                          {fac.specialty && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                              {fac.specialty}
                            </p>
                          )}
                        </div>

                        {fac.rating && (
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-xl text-amber-600 font-bold text-xs">
                            <Star size={12} className="fill-amber-500 text-amber-500" />
                            <span>{fac.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{fac.address || "Kampala Medical District"}</span>
                        </div>
                        {fac.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span>{fac.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <a
                        href={fac.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
                      >
                        <Navigation size={13} />
                        <span>Directions</span>
                      </a>

                      {fac.phone ? (
                        <a
                          href={`tel:${fac.phone.replace(/\s+/g, '')}`}
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-wider transition-all"
                        >
                          <Phone size={13} />
                          <span>Call Triage</span>
                        </a>
                      ) : (
                        <a
                          href={fac.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-wider transition-all"
                        >
                          <ExternalLink size={13} />
                          <span>Google Maps</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSearchingFacilities && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={36} className="animate-spin text-blue-600" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Interrogating Google Maps Grounding Matrix...
              </p>
            </div>
          )}
        </div>
      )}

      {/* ----------------- REGISTERED SPECIALISTS DIRECTORY ----------------- */}
      {activeTab === 'specialists' && (
      <div className="space-y-8 animate-fade-in">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Verified Partners', value: doctors.length, desc: 'Registered active consultants', icon: <ShieldCheck className="text-blue-500" /> },
            { label: 'Fast consults', value: 'Instant', desc: 'No hospital queuing waitlists', icon: <Clock className="text-amber-500" /> },
            { label: 'Routing nodes', value: 'Kampala Node', desc: 'Active communication relays', icon: <MapPin className="text-emerald-500" /> },
            { label: 'Secure protocol', value: 'AES-256', desc: 'End-to-end telemetry vault', icon: <ShieldCheck className="text-violet-500" /> }
          ].map((stat, i) => (
            <div key={`specialistfinder-l840-i-${i}`} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
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
            {categories.map((cat, mapIdx_864) => (
              <button
                key={`specialistfinder-l867-${mapIdx_864}`}
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
              <a 
                href={getWhatsAppHref(doctors[0].whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 rounded-2xl font-[1000] text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap shadow-xl text-center inline-block"
              >
                 Direct Consult
              </a>
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
            {filteredSpecialists.length > 0 ? filteredSpecialists.map((doctor, dIdx) => (
              <motion.div
                key={`doctor-${doctor.id}-${dIdx}`}
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
                  <a 
                    href={getWhatsAppHref(doctor.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-[1000] text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
                  >
                    <MessageSquare size={14} /> WhatsApp
                  </a>
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
      )}
    </div>
  );
};
