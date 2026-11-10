import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pill, 
  ShoppingCart, 
  Plus, 
  Search, 
  Bell, 
  Calendar, 
  Clock, 
  Heart, 
  Shield, 
  ShieldCheck, 
  Check, 
  CheckCircle2, 
  User, 
  Globe, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Stethoscope, 
  FileText, 
  Sparkles, 
  Trash2, 
  Minus, 
  MapPin, 
  Phone, 
  Activity, 
  AlertCircle, 
  Filter, 
  ArrowRight,
  ExternalLink,
  Printer,
  Share2
} from 'lucide-react';

export interface MedicationTrackerProps {
  user?: any;
  onNavigate?: (v: any) => void;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface CartItem {
  id: string;
  name: string;
  dosage: string;
  priceUGX: number;
  quantity: number;
  image: string;
  category: string;
}

interface PrescriptionItem {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  doctor: string;
  date: string;
  refillsRemaining: number;
  status: 'active' | 'completed' | 'expiring';
}

const POPULAR_MEDICINES = [
  {
    id: 'med-paracetamol',
    name: 'Paracetamol 500mg',
    generic: 'Acetaminophen',
    dosage: '500mg',
    priceUGX: 2000,
    image: '/assets/pharmacy/paracetamol_500mg.jpg',
    category: 'Pain & Fever',
    inStock: true,
    pack: '20 Tablets'
  },
  {
    id: 'med-amoxicillin',
    name: 'Amoxicillin 500mg',
    generic: 'Amoxicillin Trihydrate',
    dosage: '500mg',
    priceUGX: 5000,
    image: '/assets/pharmacy/amoxicillin_500mg.jpg',
    category: 'Antibiotics',
    inStock: true,
    pack: '21 Capsules'
  },
  {
    id: 'med-vitaminc',
    name: 'Vitamin C 1000mg',
    generic: 'Ascorbic Acid',
    dosage: '1000mg',
    priceUGX: 7000,
    image: '/assets/pharmacy/vitamin_c_1000mg.jpg',
    category: 'Vitamins & Immunity',
    inStock: true,
    pack: '120 Tablets'
  }
];

const EXTENDED_CATALOG = [
  ...POPULAR_MEDICINES,
  {
    id: 'med-coartem',
    name: 'Coartem (Artemether/Lumefantrine)',
    generic: 'Artemether 20mg + Lumefantrine 120mg',
    dosage: '20/120mg',
    priceUGX: 12000,
    image: '/assets/pharmacy/paracetamol_500mg.jpg',
    category: 'Antimalarial',
    inStock: true,
    pack: '24 Tablets'
  },
  {
    id: 'med-cipro',
    name: 'Ciprofloxacin 500mg',
    generic: 'Ciprofloxacin HCl',
    dosage: '500mg',
    priceUGX: 8500,
    image: '/assets/pharmacy/amoxicillin_500mg.jpg',
    category: 'Antibiotics',
    inStock: true,
    pack: '10 Tablets'
  },
  {
    id: 'med-metformin',
    name: 'Metformin 500mg',
    generic: 'Metformin Hydrochloride',
    dosage: '500mg',
    priceUGX: 6000,
    image: '/assets/pharmacy/paracetamol_500mg.jpg',
    category: 'Cardio & Diabetes',
    inStock: true,
    pack: '30 Tablets'
  },
  {
    id: 'med-ors',
    name: 'Oral Rehydration Salts (ORS + Zinc)',
    generic: 'WHO Formula ORS',
    dosage: 'Sachet',
    priceUGX: 3500,
    image: '/assets/pharmacy/vitamin_c_1000mg.jpg',
    category: 'Gastroenterology',
    inStock: true,
    pack: '5 Sachets'
  },
  {
    id: 'med-folic',
    name: 'Folic Acid + Iron (FeFo)',
    generic: 'Ferrous Sulfate + Folic Acid',
    dosage: '200mg/0.4mg',
    priceUGX: 4000,
    image: '/assets/pharmacy/vitamin_c_1000mg.jpg',
    category: 'Maternal Care',
    inStock: true,
    pack: '60 Tablets'
  }
];

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({ user, onNavigate, addToast }) => {
  // Navigation & Modal states
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'LG' | 'SW' | 'NK' | 'AC'>('EN');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
  const [showHealthToolsModal, setShowHealthToolsModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Reminders state
  const [reminderTime, setReminderTime] = useState('20:00');
  const [reminderMed, setReminderMed] = useState('Paracetamol 500mg');
  const [reminderTaken, setReminderTaken] = useState(false);

  // Active prescriptions sample data
  const [prescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-01',
      drugName: 'Paracetamol 500mg',
      dosage: '1 tablet 3x daily as needed for fever',
      frequency: 'Every 8 hours',
      doctor: 'Dr. Gloria Jayakullo',
      date: '08 Nov 2026',
      refillsRemaining: 2,
      status: 'active'
    },
    {
      id: 'rx-02',
      drugName: 'Amoxicillin 500mg',
      dosage: '1 capsule every 8 hours for 7 days',
      frequency: 'Every 8 hours with meals',
      doctor: 'Dr. Emmanuel Kato',
      date: '05 Nov 2026',
      refillsRemaining: 0,
      status: 'active'
    },
    {
      id: 'rx-03',
      drugName: 'Vitamin C 1000mg',
      dosage: '1 tablet daily morning after breakfast',
      frequency: 'Once Daily',
      doctor: 'Dr. Joseph Mukasa',
      date: '01 Nov 2026',
      refillsRemaining: 3,
      status: 'active'
    }
  ]);

  // Drug Safety Checker state
  const [safetyDrugA, setSafetyDrugA] = useState('Paracetamol');
  const [safetyDrugB, setSafetyDrugB] = useState('Alcohol / NSAIDs');

  // Cart calculations
  const totalCartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const totalCartUGX = useMemo(() => cart.reduce((acc, item) => acc + item.priceUGX * item.quantity, 0), [cart]);

  const addToCart = (med: typeof POPULAR_MEDICINES[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === med.id);
      if (existing) {
        return prev.map((i) => (i.id === med.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          priceUGX: med.priceUGX,
          quantity: 1,
          image: med.image,
          category: med.category
        }
      ];
    });
    if (addToast) {
      addToast(`Added ${med.name} to Cart (UGX ${med.priceUGX.toLocaleString()})`, 'success');
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const filteredCatalog = useMemo(() => {
    return EXTENDED_CATALOG.filter((med) => {
      const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.generic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 font-sans select-none text-slate-800 dark:text-slate-100">
      
      {/* =========================================================================
          TOP HEADER BAR (Matching Exact Photo Header)
          - Doctorian AI Logo | E-Pharmacy & Meds
          - Subtitle: Buy Medicines • Get Medical Care • Stay Healthy
          - Language Selector, Notification Badge, User Profile
         ========================================================================= */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 px-2 mb-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          {/* Doctorian AI Heart Logo */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <Heart size={22} className="text-blue-600 fill-blue-50 dark:fill-blue-950/40" />
                <Activity size={12} className="absolute text-blue-600 animate-pulse stroke-[3]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black text-blue-950 dark:text-white tracking-tight">
                Doctorian <span className="text-blue-600">AI</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700 font-light text-2xl hidden sm:inline select-none">|</span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                E-Pharmacy & Meds
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Buy Medicines • Get Medical Care • Stay Healthy
            </p>
          </div>
        </div>

        {/* Action Controls: Language, Notifications, Cart, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
          {/* Language Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer transition-all"
            >
              <Globe size={14} className="text-slate-600 dark:text-slate-300" />
              <span>{selectedLanguage}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {(['EN', 'LG', 'SW', 'NK', 'AC'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLangMenu(false);
                      if (addToast) addToast(`Language switched to ${lang}`, 'info');
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${
                      selectedLanguage === lang ? 'text-blue-600 font-black' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>{lang === 'EN' ? 'English' : lang === 'LG' ? 'Luganda' : lang === 'SW' ? 'Swahili' : lang === 'NK' ? 'Runyankole' : 'Acholi'}</span>
                    {selectedLanguage === lang && <Check size={12} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Icon & Count Badge */}
          <button
            type="button"
            onClick={() => setShowCartDrawer(true)}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Cart"
          >
            <ShoppingCart size={19} />
            {totalCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center animate-scale-in shadow-xs">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Notification Bell with Badge '2' */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={20} className="text-slate-800 dark:text-slate-200" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs">
                2
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-100">Prescription Alerts</span>
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">2 New</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-xs">
                    <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <Clock size={13} className="text-emerald-600" /> Dose Due at 8:00 PM
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">Take Paracetamol 500mg with warm water.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-xs">
                    <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Calendar size={13} className="text-blue-600" /> Next Checkup Scheduled
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">12 Nov 2026 with Dr. Gloria Jayakullo.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('profile');
              else if (addToast) addToast("Patient Profile active: " + (user?.name || "Clinical User"), "info");
            }}
            className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer shadow-xs"
            title="User Profile"
          >
            <User size={18} />
          </button>
        </div>
      </header>

      {/* =========================================================================
          HERO BANNER (Exact Layout & Visual Styling From Photo)
          - Light soft blue gradient card with 3D blister pack, bottle, stethoscope art
          - Large Headline: "E-Pharmacy & Meds"
          - Sub-headline: "Get genuine medicines and professional medical care, anytime!"
          - Blue Pill Button: "Shop Medicines >"
         ========================================================================= */}
      <section className="relative rounded-3xl bg-gradient-to-r from-sky-100 via-blue-50 to-sky-100 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 border border-sky-200/80 dark:border-slate-800 p-6 sm:p-8 md:p-10 mb-6 overflow-hidden shadow-xs">
        {/* Subtle background ambient glow */}
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-cyan-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          {/* Left Text & Call to Action */}
          <div className="w-full md:w-1/2 space-y-3 sm:space-y-4 text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.1]">
              E-Pharmacy & Meds
            </h2>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base md:text-lg max-w-md leading-snug">
              Get genuine medicines and professional medical care, anytime!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCatalogModal(true)}
                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-blue-500/30 transition-all cursor-pointer group"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingCart size={19} className="stroke-[2.5]" />
                  <span className="absolute -top-1 -right-1 text-[10px] font-black leading-none">+</span>
                </div>
                <span>Shop Medicines</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Hero Image / Artwork */}
          <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end relative">
            <div className="relative w-full max-w-md sm:max-w-lg aspect-[16/9] rounded-2xl overflow-hidden shadow-md border border-white/50 dark:border-slate-700/50 group">
              <img
                src="/assets/pharmacy/hero_banner.jpg"
                alt="Doctorian E-Pharmacy and Meds illustration with genuine medicines, blister packs, and stethoscope"
                className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  // Fallback stylish graphics container if asset load fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUR FEATURE CATEGORY CARDS (Grid matching photo)
          1. Online Pharmacy (Light Blue)
          2. Consult a Doctor (Soft Mint Green)
          3. Your Prescriptions (Soft Peach / Orange)
          4. Health Safety (Soft Lavender / Purple)
         ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        
        {/* CARD 1: Online Pharmacy */}
        <div className="relative rounded-3xl bg-blue-50/90 dark:bg-sky-950/20 border border-blue-100 dark:border-sky-900/40 p-5 sm:p-6 flex flex-col items-center text-center justify-between shadow-xs hover:shadow-md transition-all group overflow-hidden">
          {/* Faint floating capsule background watermarks */}
          <div className="absolute -top-4 -left-4 w-14 h-24 rounded-full bg-blue-200/30 dark:bg-blue-400/10 rotate-45 pointer-events-none" />
          <div className="absolute -bottom-6 -right-4 w-16 h-28 rounded-full bg-blue-200/30 dark:bg-blue-400/10 -rotate-45 pointer-events-none" />

          {/* Icon Circle */}
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-3 group-hover:scale-105 transition-transform">
            <ShoppingCart size={24} className="stroke-[2.5]" />
          </div>

          {/* Text Content */}
          <div className="space-y-1 mb-4 z-10">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              Online Pharmacy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Order medicines from anywhere
            </p>
          </div>

          {/* Pill Action Button */}
          <button
            type="button"
            onClick={() => setShowCatalogModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2 rounded-full bg-blue-100 dark:bg-sky-900/60 hover:bg-blue-200 dark:hover:bg-sky-850 text-blue-700 dark:text-blue-300 font-bold text-xs tracking-wide transition-all active:scale-95 cursor-pointer z-10"
          >
            <span>Shop Now</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* CARD 2: Consult a Doctor */}
        <div className="relative rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-5 sm:p-6 flex flex-col items-center text-center justify-between shadow-xs hover:shadow-md transition-all group overflow-hidden">
          {/* Faint medical plus cross watermarks */}
          <div className="absolute top-2 right-3 text-emerald-200/60 dark:text-emerald-800/20 text-3xl font-black pointer-events-none select-none">+</div>
          <div className="absolute bottom-3 left-3 text-emerald-200/60 dark:text-emerald-800/20 text-2xl font-black pointer-events-none select-none">+</div>

          {/* Icon Circle with Doctor Illustration */}
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/15 mb-3 group-hover:scale-105 transition-transform overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800">
              <Stethoscope size={24} className="text-emerald-700 dark:text-emerald-300 stroke-[2.2]" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-1 mb-4 z-10">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              Consult a Doctor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Talk to a qualified doctor online
            </p>
          </div>

          {/* Pill Action Button */}
          <button
            type="button"
            onClick={() => setShowDoctorModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-850 text-emerald-800 dark:text-emerald-300 font-bold text-xs tracking-wide transition-all active:scale-95 cursor-pointer z-10"
          >
            <span>Start Consultation</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* CARD 3: Your Prescriptions */}
        <div className="relative rounded-3xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-5 sm:p-6 flex flex-col items-center text-center justify-between shadow-xs hover:shadow-md transition-all group overflow-hidden">
          {/* Faint Rx watermark */}
          <div className="absolute top-2 right-4 text-amber-200/50 dark:text-amber-800/20 text-4xl font-serif font-black pointer-events-none select-none">Rx</div>
          <div className="absolute -bottom-4 -left-4 w-16 h-24 rounded-full bg-amber-200/20 pointer-events-none" />

          {/* Icon Circle */}
          <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 mb-3 group-hover:scale-105 transition-transform">
            <FileText size={24} className="stroke-[2.5]" />
          </div>

          {/* Text Content */}
          <div className="space-y-1 mb-4 z-10">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              Your Prescriptions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              View & manage your prescriptions
            </p>
          </div>

          {/* Pill Action Button */}
          <button
            type="button"
            onClick={() => setShowPrescriptionsModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2 rounded-full bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-850 text-amber-900 dark:text-amber-300 font-bold text-xs tracking-wide transition-all active:scale-95 cursor-pointer z-10"
          >
            <span>View Prescriptions</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* CARD 4: Health Safety */}
        <div className="relative rounded-3xl bg-purple-50/80 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 p-5 sm:p-6 flex flex-col items-center text-center justify-between shadow-xs hover:shadow-md transition-all group overflow-hidden">
          {/* Faint hearts watermark */}
          <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-purple-200/30 dark:bg-purple-800/10 pointer-events-none" />
          <div className="absolute bottom-2 left-3 w-10 h-10 rounded-full bg-purple-200/30 dark:bg-purple-800/10 pointer-events-none" />

          {/* Icon Circle */}
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-3 group-hover:scale-105 transition-transform">
            <Shield size={24} className="stroke-[2.5]" />
          </div>

          {/* Text Content */}
          <div className="space-y-1 mb-4 z-10">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              Health Safety
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Track your health and stay safe
            </p>
          </div>

          {/* Pill Action Button */}
          <button
            type="button"
            onClick={() => setShowHealthToolsModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2 rounded-full bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 dark:hover:bg-purple-850 text-purple-800 dark:text-purple-300 font-bold text-xs tracking-wide transition-all active:scale-95 cursor-pointer z-10"
          >
            <span>Health Tools</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </section>

      {/* =========================================================================
          BOTTOM ROW (3 Columns matching photo)
          Column 1: Popular Medicines (Paracetamol, Amoxicillin, Vitamin C)
          Column 2: Health Reminder (Take Paracetamol, Next Checkup, Set Reminder)
          Column 3: Healthy Community, Healthy Nation! (Promotional Uganda Card)
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ==================== COLUMN 1: Popular Medicines ==================== */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                  <Pill size={16} className="stroke-[2.5]" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                  Popular Medicines
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-bold inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* 3 Medicine Products Grid */}
            <div className="grid grid-cols-3 gap-3">
              {POPULAR_MEDICINES.map((med) => (
                <div
                  key={med.id}
                  className="flex flex-col items-center justify-between p-2 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all text-center group"
                >
                  {/* Product Image */}
                  <div className="w-full aspect-square rounded-xl bg-white dark:bg-slate-900 p-1 flex items-center justify-center overflow-hidden shadow-xs mb-2">
                    <img
                      src={med.image}
                      alt={med.name}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Name */}
                  <h4 className="text-[11px] sm:text-xs font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1 w-full" title={med.name}>
                    {med.name}
                  </h4>

                  {/* Price */}
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    UGX {med.priceUGX.toLocaleString()}
                  </span>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => addToCart(med)}
                    className="w-full mt-2.5 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                  >
                    <ShoppingCart size={13} className="stroke-[2.2]" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== COLUMN 2: Health Reminder ==================== */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                  <Bell size={16} className="stroke-[2.5]" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                  Health Reminder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReminderModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-bold inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Reminder Alert Item (Soft Green Pill Box) */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setReminderTaken(!reminderTaken);
                  if (addToast) addToast(reminderTaken ? "Dose marked pending" : "Great job! Paracetamol dose recorded.", "success");
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  reminderTaken ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-emerald-500 text-white'
                }`}
                title={reminderTaken ? "Mark as pending" : "Click to mark taken"}
              >
                <Check size={18} className="stroke-[3]" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                  Take your Paracetamol at 8:00 PM today.
                </p>
                {reminderTaken && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Dose marked as completed</span>
                )}
              </div>
            </div>

            {/* Next Checkup Row */}
            <div className="flex items-center gap-3 p-3 mt-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Next Checkup:</span>
                <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  12 Nov 2026
                </div>
              </div>
            </div>
          </div>

          {/* Set Reminder Button */}
          <button
            type="button"
            onClick={() => setShowReminderModal(true)}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Clock size={16} className="stroke-[2.5]" />
            <span>Set Reminder</span>
          </button>
        </div>

        {/* ==================== COLUMN 3: Healthy Community, Healthy Nation! ==================== */}
        <div 
          onClick={() => setShowCommunityModal(true)}
          className="lg:col-span-4 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-md flex flex-col justify-between min-h-[220px] cursor-pointer group hover:shadow-xl transition-all"
        >
          {/* Top Right Heart Badge */}
          <div className="absolute top-4 right-4 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <Heart size={38} className="text-white/20 fill-white/10" />
              <div className="w-7 h-7 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md font-black text-sm absolute">
                +
              </div>
            </div>
          </div>

          {/* Headline & Script */}
          <div className="relative z-10 space-y-1.5 max-w-[80%]">
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
              Healthy Community,<br />Healthy Nation!
            </h3>
            <p className="text-amber-300 font-serif italic text-base sm:text-lg font-bold tracking-wide">
              Together for a Healthier Uganda
            </p>
          </div>

          {/* Bottom Illustration: White Silhouette of Family over Uganda Flag Ribbon */}
          <div className="relative z-10 mt-6 pt-4 flex flex-col items-center">
            {/* White Silhouette Family Vector */}
            <div className="flex items-end justify-center gap-1.5 mb-1.5 text-white opacity-95">
              {/* Father */}
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                <div className="w-4 h-7 bg-white rounded-t-md mt-0.5" />
              </div>
              {/* Child 1 */}
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-white" />
                <div className="w-3 h-4 bg-white rounded-t-sm mt-0.5" />
              </div>
              {/* Child 2 */}
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <div className="w-2.5 h-3.5 bg-white rounded-t-sm mt-0.5" />
              </div>
              {/* Mother */}
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                <div className="w-3.5 h-6 bg-white rounded-t-md mt-0.5" />
              </div>
            </div>

            {/* Uganda Flag Ribbon (Black, Yellow, Red stripes) */}
            <div className="w-full h-2.5 rounded-full flex overflow-hidden shadow-md">
              <div className="flex-1 bg-black" />
              <div className="flex-1 bg-amber-400" />
              <div className="flex-1 bg-red-600" />
            </div>
          </div>
        </div>

      </section>

      {/* =========================================================================
          INTERACTIVE MODAL 1: FULL MEDICINES CATALOG & SEARCH
         ========================================================================= */}
      <AnimatePresence>
        {showCatalogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Online E-Pharmacy Catalog</h3>
                    <p className="text-xs text-slate-500">Uganda NDA Approved Genuine Medications</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicines by generic name, brand or indication..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['All', 'Pain & Fever', 'Antibiotics', 'Antimalarial', 'Vitamins & Immunity', 'Cardio & Diabetes', 'Maternal Care'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog Items Grid */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {filteredCatalog.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 hover:shadow-xs transition-all gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0">
                      <img src={med.image} alt={med.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{med.name}</h4>
                        <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                          {med.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{med.generic} • {med.pack}</p>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1 block">
                        UGX {med.priceUGX.toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(med as any)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <ShoppingCart size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE MODAL 2: CONSULT A DOCTOR
         ========================================================================= */}
      <AnimatePresence>
        {showDoctorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Online Clinical Consultation</h3>
                    <p className="text-xs text-slate-500">Connect with Verified Ugandan Physicians</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dr. Gloria Jayakullo</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Chief Medical Consultant • Mulago National Referral</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Available for real-time prescription review, second opinions, and clinical diagnosis.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dr. Emmanuel Kato</h4>
                  <p className="text-xs text-slate-500 font-medium">Cardiologist & Internal Medicine • Mbarara Regional Referral</p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDoctorModal(false);
                    if (onNavigate) onNavigate('specialist');
                    else if (addToast) addToast("Doctor consultation room launched", "success");
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Phone size={16} />
                  <span>Connect with Doctor Now</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE MODAL 3: YOUR PRESCRIPTIONS
         ========================================================================= */}
      <AnimatePresence>
        {showPrescriptionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] p-5 sm:p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Your Active Prescriptions</h3>
                    <p className="text-xs text-slate-500">Official Clinical Digital Prescriptions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrescriptionsModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">{rx.drugName}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase">
                        {rx.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{rx.dosage}</p>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Prescribed by {rx.doctor}</span>
                      <span>{rx.refillsRemaining} refills left</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (addToast) addToast("Digital prescription PDF exported", "info");
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Export Prescription PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE MODAL 4: HEALTH SAFETY & DRUG INTERACTION CHECKER
         ========================================================================= */}
      <AnimatePresence>
        {showHealthToolsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Clinical Health Safety Tools</h3>
                    <p className="text-xs text-slate-500">Contraindications & Drug Interactions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHealthToolsModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block mb-2">Drug Interaction Simulator:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Drug 1</label>
                      <input
                        type="text"
                        value={safetyDrugA}
                        onChange={(e) => setSafetyDrugA(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Drug 2 / Substance</label>
                      <input
                        type="text"
                        value={safetyDrugB}
                        onChange={(e) => setSafetyDrugB(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-purple-100 dark:border-purple-900/30 text-xs">
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Safe Under Standard Clinical Limits
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Ensure maximum Paracetamol dose does not exceed 4,000mg in 24 hours to prevent hepatic strain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHealthToolsModal(false)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE MODAL 5: SET HEALTH REMINDER
         ========================================================================= */}
      <AnimatePresence>
        {showReminderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Schedule Pill Reminder</h3>
                    <p className="text-xs text-slate-500">Automated Alarm & SMS Notification</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Medication Name</label>
                  <input
                    type="text"
                    value={reminderMed}
                    onChange={(e) => setReminderMed(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dose Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReminderModal(false);
                    if (addToast) addToast(`Reminder set for ${reminderMed} at ${reminderTime}`, 'success');
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all"
                >
                  Save Reminder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE MODAL 6: UGANDA HEALTH COMMUNITY
         ========================================================================= */}
      <AnimatePresence>
        {showCommunityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Healthy Community, Healthy Nation!</h3>
                  <p className="text-xs text-amber-600 font-serif italic font-bold">Together for a Healthier Uganda</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCommunityModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200">Ministry of Health (MOH) Community Outreach</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Free childhood immunizations, maternal health checkups, and malaria prevention programs across Kampala, Jinja, Gulu, and Mbarara.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200">Affordable Essential Medicines Guarantee</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Ensuring all essential medicines remain accessible to every Ugandan family at transparent, regulated prices.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCommunityModal(false)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE DRAWER: SHOPPING CART & CHECKOUT
         ========================================================================= */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-5 sm:p-6 flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-blue-600" />
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Your Pharmacy Cart</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShoppingCart size={48} className="mb-3 opacity-40 text-blue-500" />
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Browse our medicines and click Add to Cart</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCartDrawer(false);
                      setShowCatalogModal(true);
                    }}
                    className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-full text-xs font-bold cursor-pointer"
                  >
                    Browse Medicines
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-slate-900 p-1" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{item.name}</h4>
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                            UGX {(item.priceUGX * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-slate-500 hover:text-rose-600"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-slate-500 hover:text-blue-600"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Subtotal:</span>
                      <span className="font-black text-lg text-slate-900 dark:text-white">UGX {totalCartUGX.toLocaleString()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCart([]);
                        setShowCartDrawer(false);
                        if (addToast) addToast(`Order placed for UGX ${totalCartUGX.toLocaleString()}! Dispatching to your location.`, 'success');
                      }}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                    >
                      Checkout with Mobile Money (MTN / Airtel)
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MedicationTracker;
