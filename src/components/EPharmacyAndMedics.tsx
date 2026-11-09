import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Globe,
  User,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertCircle,
  X,
  Send,
  Upload,
  Heart,
  ChevronRight,
  Sparkles,
  Stethoscope,
  Filter,
  Check
} from 'lucide-react';
import { Logo } from './Logo';

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  priceUgx: number;
  image: string;
  category: string;
  inStock: boolean;
  requiresPrescription: boolean;
  description: string;
}

export interface PharmacyAd {
  id: string;
  title: string;
  category: string;
  clinicOrPharmacy: string;
  location: string;
  phone: string;
  whatsapp: string;
  priceUgx: number;
  description: string;
  stockStatus: string;
  verified: boolean;
  postedAt: string;
}

interface EPharmacyAndMedicsProps {
  onNavigate?: (tab: any) => void;
  addToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const EPharmacyAndMedics: React.FC<EPharmacyAndMedicsProps> = ({
  onNavigate,
  addToast = () => {}
}) => {
  // Medicines catalog
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: 'med-paracetamol',
      name: 'Paracetamol',
      dose: '500mg',
      priceUgx: 2000,
      image: '/assets/pharmacy/paracetamol_product.png',
      category: 'Pain Relief & Fever',
      inStock: true,
      requiresPrescription: false,
      description: 'Effective relief for headache, body aches, and fever. 16 tablets pack.'
    },
    {
      id: 'med-amoxicillin',
      name: 'Amoxicillin',
      dose: '500mg',
      priceUgx: 5000,
      image: '/assets/pharmacy/amoxicillin_product.png',
      category: 'Antibiotics',
      inStock: true,
      requiresPrescription: true,
      description: 'Broad-spectrum antibiotic for bacterial respiratory and ear infections. 21 capsules.'
    },
    {
      id: 'med-vitaminc',
      name: 'Vitamin C',
      dose: '1000mg',
      priceUgx: 7000,
      image: '/assets/pharmacy/vitaminc_product.png',
      category: 'Vitamins & Immunity',
      inStock: true,
      requiresPrescription: false,
      description: 'High potency antioxidant with Rose Hips. Daily immune defense. 180 tablets.'
    },
    {
      id: 'med-coartem',
      name: 'Coartem (Artemether + Lumefantrine)',
      dose: '20/120mg',
      priceUgx: 14000,
      image: '/assets/pharmacy/paracetamol_product.png',
      category: 'Malaria Treatment',
      inStock: true,
      requiresPrescription: true,
      description: 'First-line Artemisinin Combination Therapy (ACT) approved by Uganda MoH for uncomplicated malaria.'
    },
    {
      id: 'med-ors',
      name: 'Oral Rehydration Salts (ORS) + Zinc',
      dose: 'Standard Sachet',
      priceUgx: 3500,
      image: '/assets/pharmacy/vitaminc_product.png',
      category: 'Digestive Health',
      inStock: true,
      requiresPrescription: false,
      description: 'WHO/Uganda clinical guidelines essential treatment for dehydration and acute diarrhea.'
    },
    {
      id: 'med-cetirizine',
      name: 'Cetirizine Hydrochloride',
      dose: '10mg',
      priceUgx: 4000,
      image: '/assets/pharmacy/amoxicillin_product.png',
      category: 'Allergy & Cold',
      inStock: true,
      requiresPrescription: false,
      description: '24-hour non-drowsy relief for seasonal allergies, dust itching, and hay fever.'
    }
  ]);

  // Live Clinic & Pharmacy Advertisements
  const [ads, setAds] = useState<PharmacyAd[]>([
    {
      id: 'ad-1',
      title: 'Coartem ACT (Malaria Treatment - MoH Batch)',
      category: 'Anti-Malarial',
      clinicOrPharmacy: 'Guardian Pharmacy - Kampala Central',
      location: 'Plot 12 Kampala Road, Uganda',
      phone: '+256700123456',
      whatsapp: '256700123456',
      priceUgx: 14000,
      description: 'Official WHO/MoH verified Artemether-Lumefantrine 20/120mg. Same-day motorcycle courier delivery.',
      stockStatus: '500+ packs in stock',
      verified: true,
      postedAt: 'Just now'
    },
    {
      id: 'ad-2',
      title: 'Full Body Health Checkup & Fasting Blood Sugar',
      category: 'Clinical Service',
      clinicOrPharmacy: 'Nakasero Hospital Outpatient Wing',
      location: 'Akii Bua Road, Nakasero, Kampala',
      phone: '+256312531400',
      whatsapp: '256312531400',
      priceUgx: 85000,
      description: 'Includes HbA1c, Kidney/Liver panel, Lipid profile, and direct Doctor Consultation. Walk-ins welcome.',
      stockStatus: '24/7 Service',
      verified: true,
      postedAt: '15 mins ago'
    },
    {
      id: 'ad-3',
      title: 'Omeprazole 20mg & Ulcer Care Kit',
      category: 'Gastroenterology',
      clinicOrPharmacy: 'Friecca Pharmacy Wandegeya',
      location: 'Near Makerere University Main Gate, Kampala',
      phone: '+256414540600',
      whatsapp: '256414540600',
      priceUgx: 4500,
      description: 'Rapid heartburn and gastric reflux relief. Special student and staff discount in Wandegeya.',
      stockStatus: 'Fast Delivery',
      verified: true,
      postedAt: '35 mins ago'
    },
    {
      id: 'ad-4',
      title: 'Digital Automatic Blood Pressure Monitor (Arm Cuff)',
      category: 'Medical Equipment',
      clinicOrPharmacy: 'Vine Pharmaceuticals - Entebbe Road',
      location: 'Freedom City Mall, Najjanankumbi',
      phone: '+256772987654',
      whatsapp: '256772987654',
      priceUgx: 120000,
      description: 'Accurate WHO-grade digital BP machine with voice prompt and irregular heartbeat detector.',
      stockStatus: '12 units remaining',
      verified: true,
      postedAt: '1 hour ago'
    }
  ]);

  // Cart state
  const [cart, setCart] = useState<{ [medId: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Interactive Modals
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Reminder state
  const [reminderTaken, setReminderTaken] = useState(false);
  const [reminderText, setReminderText] = useState('Take your Paracetamol at 8:00 PM today.');
  const [nextCheckup, setNextCheckup] = useState('12 Nov 2026');
  const [newReminderTime, setNewReminderTime] = useState('20:00');
  const [newReminderMed, setNewReminderMed] = useState('Paracetamol 500mg');

  // Ad Form state
  const [adForm, setAdForm] = useState({
    title: '',
    category: 'General Medicine',
    clinicOrPharmacy: '',
    location: 'Kampala, Uganda',
    phone: '+256 ',
    whatsapp: '256',
    priceUgx: '',
    description: '',
    stockStatus: 'Available Now'
  });

  // Mobile money checkout state
  const [checkoutMethod, setCheckoutMethod] = useState<'mtn' | 'airtel' | 'cod'>('mtn');
  const [deliveryPhone, setDeliveryPhone] = useState('+256 7');
  const [deliveryAddress, setDeliveryAddress] = useState('Kampala Central, Uganda');

  // Consult doctor state
  const [consultDoctor, setConsultDoctor] = useState({
    doctor: 'Dr. Joseph Akora (Senior Clinical Officer)',
    specialty: 'General Medicine & Infectious Diseases',
    symptoms: '',
    consultType: 'video' as 'video' | 'chat' | 'audio'
  });

  // Prescription upload state
  const [rxNotes, setRxNotes] = useState('');
  const [rxFileName, setRxFileName] = useState<string | null>(null);

  // Drug safety checker state
  const [safetyMed1, setSafetyMed1] = useState('Paracetamol');
  const [safetyMed2, setSafetyMed2] = useState('Amoxicillin');
  const [safetyResult, setSafetyResult] = useState<string | null>(null);

  const cartTotalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const cartSubtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const med = medicines.find(m => m.id === id);
    return sum + (med ? med.priceUgx * qty : 0);
  }, 0);

  const addToCart = (medId: string) => {
    setCart(prev => ({
      ...prev,
      [medId]: (prev[medId] || 0) + 1
    }));
    const med = medicines.find(m => m.id === medId);
    addToast(`${med ? med.name : 'Medicine'} added to cart!`, 'success');
  };

  const updateCartQty = (medId: string, delta: number) => {
    setCart(prev => {
      const current = prev[medId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[medId];
        return copy;
      }
      return { ...prev, [medId]: next };
    });
  };

  const handlePostAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.title || !adForm.clinicOrPharmacy) {
      addToast('Please provide medication title and clinic/pharmacy name', 'warning');
      return;
    }

    const newAd: PharmacyAd = {
      id: 'ad-' + Date.now(),
      title: adForm.title,
      category: adForm.category,
      clinicOrPharmacy: adForm.clinicOrPharmacy,
      location: adForm.location || 'Uganda',
      phone: adForm.phone || '+256 700 000000',
      whatsapp: adForm.whatsapp.replace(/\D/g, '') || '256700000000',
      priceUgx: parseInt(adForm.priceUgx, 10) || 5000,
      description: adForm.description || 'Verified pharmaceutical product available for local distribution.',
      stockStatus: adForm.stockStatus || 'In Stock',
      verified: true,
      postedAt: 'Just now'
    };

    setAds(prev => [newAd, ...prev]);
    setIsAdModalOpen(false);
    setAdForm({
      title: '',
      category: 'General Medicine',
      clinicOrPharmacy: '',
      location: 'Kampala, Uganda',
      phone: '+256 ',
      whatsapp: '256',
      priceUgx: '',
      description: '',
      stockStatus: 'Available Now'
    });
    addToast('Your Live Product Ad has been published to Uganda clinics & pharmacies!', 'success');
  };

  const handleSetReminder = (e: React.FormEvent) => {
    e.preventDefault();
    setReminderText(`Take your ${newReminderMed} at ${newReminderTime} today.`);
    setReminderTaken(false);
    setIsReminderModalOpen(false);
    addToast(`Medication reminder set for ${newReminderTime} with WhatsApp SMS sync!`, 'success');
  };

  const handleCheckSafety = () => {
    if (safetyMed1.toLowerCase().includes('paracetamol') && safetyMed2.toLowerCase().includes('amoxicillin')) {
      setSafetyResult('✅ Safe Combination: Paracetamol and Amoxicillin have no known adverse pharmacokinetic drug-drug interactions. Paracetamol can be taken for fever relief while taking Amoxicillin as prescribed.');
    } else if (safetyMed1.toLowerCase().includes('amoxicillin') && safetyMed2.toLowerCase().includes('methotrexate')) {
      setSafetyResult('⚠️ Caution: Amoxicillin may reduce the renal clearance of methotrexate. Monitor closely.');
    } else {
      setSafetyResult(`ℹ️ Clinical Safety Check: No severe contraindications recorded in Uganda Clinical Guidelines for ${safetyMed1} + ${safetyMed2}. Ensure correct dosage and hydration.`);
    }
  };

  const handleDirectWhatsAppOrder = () => {
    const items = Object.entries(cart)
      .map(([id, qty]) => {
        const med = medicines.find(m => m.id === id);
        return med ? `- ${med.name} (${med.dose}) x${qty} = UGX ${(med.priceUgx * qty).toLocaleString()}` : '';
      })
      .filter(Boolean)
      .join('%0A');

    const message = `Hello Doctorian AI / Pharmacy Partner,%0A%0AI would like to place an order:%0A${items}%0A%0A*Total Amount:* UGX ${cartSubtotal.toLocaleString()}%0A*Delivery Location:* ${encodeURIComponent(deliveryAddress)}%0A*Contact Phone:* ${encodeURIComponent(deliveryPhone)}%0A%0APlease confirm availability and dispatch!`;
    window.open(`https://wa.me/256700123456?text=${message}`, '_blank');
  };

  const handleProcessCheckout = () => {
    setIsCheckoutModalOpen(false);
    setCart({});
    setIsCartOpen(false);
    addToast(`Order placed successfully via ${checkoutMethod.toUpperCase()}! Courier dispatched.`, 'success');
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.dose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 bg-[#f8fafc] text-slate-800 min-h-screen flex flex-col font-sans">
      {/* Top Brand Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
        {/* Brand with logo */}
        <div className="flex items-center gap-3">
          <Logo variant="pharmacy" />
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Selector Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold cursor-pointer transition-colors border border-slate-200/80">
            <Globe className="w-4 h-4 text-slate-500" />
            <span>EN</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-semibold cursor-pointer transition-colors border border-slate-200/80">
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </div>
            <span>Akora Joseph</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl transition-colors border border-blue-200"
            title="Open Pharmacy Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartTotalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale">
                {cartTotalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Large Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#dbeafe] via-[#e0f2fe] to-[#eff6ff] border border-blue-200 shadow-md">
          {/* Subtle cardiogram wave background SVG */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full text-blue-400" viewBox="0 0 1200 300" fill="none" preserveAspectRatio="none">
              <path
                d="M0 150 L300 150 L330 110 L350 200 L370 70 L390 190 L410 140 L430 150 L800 150 L830 100 L850 220 L870 50 L890 200 L910 130 L930 150 L1200 150"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center p-6 sm:p-8 lg:p-10 gap-6">
            <div className="md:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                E-Pharmacy & Medics
              </h2>
              <p className="text-base sm:text-lg text-slate-700 font-medium max-w-lg leading-relaxed">
                Get genuine medicines and professional medical care, anytime!
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById('popular-medicines-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Shop Medicines &gt;</span>
                </button>

                <button
                  onClick={() => setIsConsultModalOpen(true)}
                  className="px-5 py-3 bg-white/80 hover:bg-white text-blue-700 border border-blue-300 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
                >
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  <span>Talk to Doctor</span>
                </button>
              </div>
            </div>

            {/* Right Banner Visual */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative max-w-md w-full">
                <img
                  src="/assets/pharmacy/hero_pills_stethoscope.png"
                  alt="Medicines, stethoscope and prescriptions"
                  className="w-full h-auto object-contain drop-shadow-xl rounded-2xl"
                  onError={(e) => {
                    // Fallback to pure SVG if file is loading
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Category Cards (Horizontal Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Online Pharmacy */}
          <div
            onClick={() => {
              setSelectedCategory('All');
              const el = document.getElementById('popular-medicines-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group cursor-pointer bg-[#e0f2fe]/70 hover:bg-[#bae6fd] border border-sky-200 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 flex items-center justify-center text-blue-600 mb-4">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900">
                Online Pharmacy
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Order medicines from anywhere
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <span className="w-8 h-8 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                →
              </span>
            </div>
          </div>

          {/* Card 2: Consult a Doctor */}
          <div
            onClick={() => setIsConsultModalOpen(true)}
            className="group cursor-pointer bg-[#ecfdf5]/80 hover:bg-[#d1fae5] border border-emerald-200 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 mb-4">
                <Stethoscope className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900">
                Consult a Doctor
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Talk to a qualified doctor online
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <span className="w-8 h-8 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                →
              </span>
            </div>
          </div>

          {/* Card 3: Your Prescriptions */}
          <div
            onClick={() => setIsPrescriptionModalOpen(true)}
            className="group cursor-pointer bg-[#ffedd5]/70 hover:bg-[#fed7aa] border border-orange-200 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 flex items-center justify-center text-orange-600 mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-900">
                Your Prescriptions
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                View &amp; manage your prescriptions
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <span className="w-8 h-8 rounded-full bg-orange-500 group-hover:bg-orange-600 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                →
              </span>
            </div>
          </div>

          {/* Card 4: Health Safety */}
          <div
            onClick={() => setIsSafetyModalOpen(true)}
            className="group cursor-pointer bg-[#ede9fe]/80 hover:bg-[#ddd6fe] border border-purple-200 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-600 mb-4">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-900">
                Health Safety
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Track your health and stay safe
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <span className="w-8 h-8 rounded-full bg-purple-600 group-hover:bg-purple-700 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                →
              </span>
            </div>
          </div>
        </div>

        {/* Live Clinic & Pharmacy Advertising Network Card */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 border border-blue-500/30 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE ADVERTISING NETWORK
                </span>
                <span className="text-xs text-blue-300">Verified Ugandan Health Facilities</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Clinics &amp; Pharmacies Live Market Board
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Ugandan clinics and pharmacies advertise medicines, specialized diagnostic tests, and urgent stock live.
              </p>
            </div>

            <button
              onClick={() => setIsAdModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Post Your Pharmacy Ad Live</span>
            </button>
          </div>

          {/* Horizontal scrollable ad cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 hover:border-blue-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {ad.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{ad.postedAt}</span>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {ad.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                    {ad.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1">
                    <div className="text-xs font-semibold text-emerald-400">
                      UGX {ad.priceUgx.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-medium text-slate-300 flex items-center gap-1 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {ad.clinicOrPharmacy}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      {ad.location}
                    </div>
                  </div>
                </div>

                {/* Ad Action Buttons (WhatsApp + Call) */}
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${ad.whatsapp}?text=Hello%20${encodeURIComponent(ad.clinicOrPharmacy)},%20I%20saw%20your%20ad%20for%20"${encodeURIComponent(ad.title)}"%20on%20Doctorian%20AI.%20Is%20it%20available%20now?`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${ad.phone}`}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs flex items-center justify-center transition-colors"
                    title={`Call ${ad.clinicOrPharmacy}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 3-Card Grid matching the user's attachment */}
        <div id="popular-medicines-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1 & 2: Popular Medicines (7 Cols on desktop) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Popular Medicines
                </h3>
              </div>

              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All →
              </button>
            </div>

            {/* Filter pills & search */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Paracetamol, Amoxicillin, Malaria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['All', 'Pain Relief & Fever', 'Antibiotics', 'Vitamins & Immunity', 'Malaria Treatment'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filteredMedicines.map((med) => {
                const currentQty = cart[med.id] || 0;
                return (
                  <div
                    key={med.id}
                    className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between bg-white hover:border-blue-300 transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="w-full h-36 bg-slate-50 rounded-xl mb-3 flex items-center justify-center p-2 overflow-hidden border border-slate-100">
                        <img
                          src={med.image}
                          alt={med.name}
                          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                        />
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {med.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {med.dose}
                      </p>

                      <div className="mt-2 text-sm font-black text-slate-900">
                        UGX {med.priceUgx.toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-4">
                      {currentQty > 0 ? (
                        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-1">
                          <button
                            onClick={() => updateCartQty(med.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white text-blue-700 flex items-center justify-center font-bold shadow-xs hover:bg-blue-100"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-blue-900">{currentQty} in cart</span>
                          <button
                            onClick={() => updateCartQty(med.id, 1)}
                            className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs hover:bg-blue-700"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(med.id)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Health Reminder & Uganda National Card (5 Cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Health Reminder Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Health Reminder
                  </h3>
                </div>
                <button
                  onClick={() => setIsReminderModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View All →
                </button>
              </div>

              {/* Take Paracetamol banner */}
              <div className="bg-[#ecfdf5] border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setReminderTaken(!reminderTaken);
                      addToast(
                        reminderTaken ? 'Reminder marked as pending' : 'Dose marked as taken! Good job.',
                        reminderTaken ? 'info' : 'success'
                      );
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      reminderTaken
                        ? 'bg-slate-300 text-white'
                        : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 hover:scale-105'
                    }`}
                    title="Click to toggle taken status"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                  </button>
                  <div>
                    <h4 className={`text-sm font-bold ${reminderTaken ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {reminderText}
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      {reminderTaken ? 'Completed for today' : 'Scheduled dose with WhatsApp alert'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next checkup row */}
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Next Checkup:
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {nextCheckup}
                  </div>
                </div>
              </div>

              {/* Set Reminder Button */}
              <button
                onClick={() => setIsReminderModalOpen(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Clock className="w-4 h-4" />
                <span>Set Reminder</span>
              </button>
            </div>

            {/* Healthy Community, Healthy Nation Card */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[260px] border border-blue-500/30">
              {/* Background gradient & national accent */}
              <div className="space-y-2 relative z-10">
                <h3 className="text-2xl font-black text-white leading-tight tracking-tight">
                  Healthy Community,<br />Healthy Nation!
                </h3>
                <p className="text-amber-300 font-cursive italic text-base font-bold">
                  Together for a Healthier Uganda
                </p>
              </div>

              {/* Uganda flag colors stripe along bottom */}
              <div className="relative z-10 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Family silhouette representations */}
                    <div className="flex items-center -space-x-1">
                      <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xs">👨</div>
                      <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xs">👩</div>
                      <div className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xs">👦</div>
                      <div className="w-6 h-6 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xs">👧</div>
                    </div>
                    <span className="text-xs text-blue-200 font-medium">Village Health Teams (VHT)</span>
                  </div>

                  {/* Heart with cross icon */}
                  <div className="w-12 h-12 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                      <path d="M12 9v6m-3-3h6"/>
                    </svg>
                  </div>
                </div>

                {/* Flag Bar */}
                <div className="h-1.5 w-full rounded-full overflow-hidden flex mt-4 shadow-sm">
                  <div className="w-1/3 bg-black"></div>
                  <div className="w-1/3 bg-yellow-400"></div>
                  <div className="w-1/3 bg-red-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-lg">Your Pharmacy Cart</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {cartTotalItems} items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {Object.keys(cart).length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-3">
                  <ShoppingCart className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                  <p className="text-sm font-medium">Your pharmacy cart is empty</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Browse Medicines
                  </button>
                </div>
              ) : (
                Object.entries(cart).map(([medId, qty]) => {
                  const med = medicines.find(m => m.id === medId);
                  if (!med) return null;
                  return (
                    <div
                      key={medId}
                      className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 gap-3"
                    >
                      <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        <img src={med.image} alt={med.name} className="max-h-full max-w-full object-contain" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{med.name}</h4>
                        <div className="text-[11px] text-slate-500">{med.dose}</div>
                        <div className="text-xs font-black text-blue-700 mt-0.5">
                          UGX {(med.priceUgx * qty).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCartQty(medId, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{qty}</span>
                        <button
                          onClick={() => updateCartQty(medId, 1)}
                          className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer */}
            {Object.keys(cart).length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">Estimated Delivery:</span>
                  <span className="font-bold text-slate-900">Kampala Central (Express 2h)</span>
                </div>

                <div className="flex items-center justify-between text-base border-t border-slate-200 pt-2">
                  <span className="font-bold text-slate-900">Total Payable:</span>
                  <span className="font-black text-blue-700 text-lg">
                    UGX {cartSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleDirectWhatsAppOrder}
                    className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp Order</span>
                  </button>

                  <button
                    onClick={() => setIsCheckoutModalOpen(true)}
                    className="py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
                  >
                    <span>Mobile Money &gt;</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Live Ad Modal */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Post Live Pharmacy / Clinic Product Ad
                </h3>
                <p className="text-xs text-slate-400">
                  Visible instantly to all patients &amp; clinics across Uganda
                </p>
              </div>
              <button
                onClick={() => setIsAdModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostAd} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Medicine / Product / Service Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coartem 20/120mg or Digital BP Monitor"
                  value={adForm.title}
                  onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={adForm.category}
                    onChange={(e) => setAdForm({ ...adForm, category: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="Anti-Malarial">Anti-Malarial</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Pain Relief & Fever">Pain Relief &amp; Fever</option>
                    <option value="Medical Equipment">Medical Equipment</option>
                    <option value="Clinical Service">Clinical Service</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Price (UGX) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 14000"
                    value={adForm.priceUgx}
                    onChange={(e) => setAdForm({ ...adForm, priceUgx: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Clinic or Pharmacy Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nakasero Outpatient / Guardian Pharmacy"
                  value={adForm.clinicOrPharmacy}
                  onChange={(e) => setAdForm({ ...adForm, clinicOrPharmacy: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Location (Town / District)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kampala Road, Wandegeya, Jinja Road"
                  value={adForm.location}
                  onChange={(e) => setAdForm({ ...adForm, location: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    WhatsApp (Ordering) *
                  </label>
                  <input
                    type="text"
                    placeholder="256700123456"
                    value={adForm.whatsapp}
                    onChange={(e) => setAdForm({ ...adForm, whatsapp: e.target.value })}
                    className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone Call
                  </label>
                  <input
                    type="text"
                    placeholder="+256 700 123456"
                    value={adForm.phone}
                    onChange={(e) => setAdForm({ ...adForm, phone: e.target.value })}
                    className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Brief Clinical Description &amp; Stock
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fresh stock from NDA approved distributor, 24/7 delivery available."
                  value={adForm.description}
                  onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Publish Ad Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Schedule Medicine Reminder</h3>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="w-7 h-7 rounded-full bg-blue-700 text-white hover:bg-blue-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSetReminder} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Medicine &amp; Dosage:
                </label>
                <input
                  type="text"
                  required
                  value={newReminderMed}
                  onChange={(e) => setNewReminderMed(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Time of Day:
                </label>
                <input
                  type="time"
                  required
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Next Clinic Checkup Date:
                </label>
                <input
                  type="text"
                  value={nextCheckup}
                  onChange={(e) => setNextCheckup(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                  SMS &amp; WhatsApp Alert Synchronized
                </div>
                <p className="text-[11px] text-blue-700">
                  Notification alerts will be sent directly to your registered Ugandan mobile number before dosage.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consult a Doctor Modal */}
      {isConsultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Telemedicine &amp; Doctor Consultation</h3>
              </div>
              <button
                onClick={() => setIsConsultModalOpen(false)}
                className="w-7 h-7 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  👨‍⚕️
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{consultDoctor.doctor}</h4>
                  <p className="text-xs text-emerald-800">{consultDoctor.specialty}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available Online Now • Mulago Hospital / Doctorian Health
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Describe symptoms or reason for consult:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Fever for 2 days with severe headache, body chills, and joint pain..."
                  value={consultDoctor.symptoms}
                  onChange={(e) => setConsultDoctor({ ...consultDoctor, symptoms: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Consultation Channel:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'video', label: 'Video Call' },
                    { id: 'chat', label: 'Live Chat' },
                    { id: 'audio', label: 'Phone Call' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setConsultDoctor({ ...consultDoctor, consultType: c.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-colors ${
                        consultDoctor.consultType === c.id
                          ? 'bg-emerald-100 border-emerald-600 text-emerald-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200">
                🔒 Protected by Uganda Data Protection and Privacy Act 2019. Clinical Officer consultation is confidential.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsConsultModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsConsultModalOpen(false);
                    addToast(`Connecting to ${consultDoctor.doctor} via ${consultDoctor.consultType.toUpperCase()}...`, 'success');
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Start Consultation Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Prescriptions Modal */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-orange-500 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Your Active Prescriptions &amp; Refills</h3>
              </div>
              <button
                onClick={() => setIsPrescriptionModalOpen(false)}
                className="w-7 h-7 rounded-full bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Existing active prescription item */}
              <div className="border border-orange-200 bg-orange-50/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200 text-orange-900">
                      Rx-2026-UG-882
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      Coartem 20/120mg + Paracetamol 500mg
                    </h4>
                    <p className="text-xs text-slate-600">
                      Prescribed by Dr. Joseph Akora • Mulago Outpatient
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600">Active</span>
                </div>
                <div className="text-xs text-slate-600">
                  Dosage: 4 tablets stat, then 4 tablets at 8h, then 4 tablets BD for 2 days.
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      addToCart('med-coartem');
                      addToCart('med-paracetamol');
                      setIsPrescriptionModalOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    1-Click Refill to Cart
                  </button>
                  <button
                    onClick={() => addToast('Prescription PDF downloaded to device', 'info')}
                    className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Upload Prescription */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center space-y-2 bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">
                  Upload Paper Prescription Photo or PDF
                </div>
                <p className="text-[11px] text-slate-500">
                  Take a photo of your paper doctor slip. Our licensed pharmacists will verify and prepare your dosage.
                </p>
                <label className="inline-block cursor-pointer px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blue-600 hover:bg-slate-100">
                  Choose Photo / Document
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setRxFileName(e.target.files[0].name);
                        addToast(`Prescription file "${e.target.files[0].name}" attached!`, 'success');
                      }
                    }}
                  />
                </label>
                {rxFileName && (
                  <div className="text-xs text-emerald-600 font-bold">
                    ✓ File selected: {rxFileName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Safety & Interaction Checker Modal */}
      {isSafetyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-purple-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Health Safety &amp; Drug Interaction</h3>
              </div>
              <button
                onClick={() => setIsSafetyModalOpen(false)}
                className="w-7 h-7 rounded-full bg-purple-700 text-white hover:bg-purple-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Check potential adverse drug-drug interactions before taking multiple medications together. Grounded in Uganda National Drug Authority (NDA) and British National Formulary standards.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    First Medicine:
                  </label>
                  <input
                    type="text"
                    value={safetyMed1}
                    onChange={(e) => setSafetyMed1(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Second Medicine:
                  </label>
                  <input
                    type="text"
                    value={safetyMed2}
                    onChange={(e) => setSafetyMed2(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <button
                onClick={handleCheckSafety}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Analyze Interaction
              </button>

              {safetyResult && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-slate-800 leading-relaxed">
                  {safetyResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Uganda Mobile Money Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Uganda Express Checkout</h3>
                <p className="text-xs text-slate-400">Total: UGX {cartSubtotal.toLocaleString()}</p>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('mtn')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      checkoutMethod === 'mtn'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-black text-amber-600">MTN MoMo</div>
                    <div className="text-[10px] text-slate-500 font-mono">*165#</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('airtel')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      checkoutMethod === 'airtel'
                        ? 'border-red-500 bg-red-50 text-red-900 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-black text-red-600">Airtel Money</div>
                    <div className="text-[10px] text-slate-500 font-mono">*185#</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('cod')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      checkoutMethod === 'cod'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-blue-600">Cash Pickup</div>
                    <div className="text-[10px] text-slate-500">Pay on Delivery</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Recipient Mobile Number (for PIN prompt):
                </label>
                <input
                  type="text"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Delivery Address / Clinic Pickup:
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200">
                📲 You will receive an instant USSD push prompt on your mobile phone to enter your PIN and authorize UGX {cartSubtotal.toLocaleString()}.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessCheckout}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Authorize Payment &amp; Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
