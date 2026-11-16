import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Phone,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  Clock,
  Pill,
  FileText,
  X,
  Stethoscope,
  Printer,
  ChevronRight,
  WifiOff,
  Send,
  History
} from 'lucide-react';
import { api, User } from '../api';
import { UGANDA_MEDICINES, UGANDA_PHARMACIES, MedicineItem } from './AppMedics';

interface EPharmacyAndMedicsProps {
  onNavigate?: (tab: any) => void;
  addToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  user?: User | null;
}

interface CartItem {
  medicine: MedicineItem;
  qty: number;
  selectedPharmacyId: string;
  selectedPharmacyName: string;
  unitPriceUgx: number;
}

const EXTRA_OTC_MEDICINES: MedicineItem[] = [
  {
    id: 'med-paracetamol-500',
    name: 'Paracetamol 500mg BP',
    genericName: 'Acetaminophen BP',
    category: 'pain_analgesic',
    form: 'Tablet',
    dosage: '500mg',
    packSize: 'Strip of 20 Tablets',
    priceUGX: 2500,
    priceUSD: 0.65,
    prescriptionRequired: false,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Fever reduction, headache, mild-to-moderate somatic pain (pregnancy-safe)',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Nakasero', priceUGX: 2500, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 2000, inStock: true },
      { pharmacyId: 'vine', pharmacyName: 'Vine Pharmacy', branch: 'Kampala Rd', priceUGX: 3000, inStock: true }
    ]
  },
  {
    id: 'med-vitaminc-1000',
    name: 'Vitamin C 1000mg + Zinc',
    genericName: 'Ascorbic Acid 1000mg / Zinc 15mg Effervescent',
    category: 'pain_analgesic',
    form: 'Tablet',
    dosage: '1000mg',
    packSize: 'Tube of 20 Effervescent Tablets',
    priceUGX: 12000,
    priceUSD: 3.15,
    prescriptionRequired: false,
    ndaApproved: true,
    mohEssential: false,
    inStock: true,
    primaryIndication: 'Immune resilience, collagen synthesis & iron absorption cofactor',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Lugogo Mall', priceUGX: 12000, inStock: true },
      { pharmacyId: 'guardian', pharmacyName: 'Guardian', branch: 'Acacia Mall', priceUGX: 13500, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 11500, inStock: true }
    ]
  }
];

const ALL_CATALOG_MEDICINES: MedicineItem[] = [...EXTRA_OTC_MEDICINES, ...UGANDA_MEDICINES];

const CATEGORY_TABS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All Medicines' },
  { id: 'antimalarial', label: 'Antimalarials' },
  { id: 'antibiotic', label: 'Antibiotics' },
  { id: 'cardio_diabetes', label: 'Heart & Diabetes' },
  { id: 'pain_analgesic', label: 'Pain & Immunity' },
  { id: 'respiratory', label: 'Respiratory' },
  { id: 'gastro', label: 'Digestive' },
  { id: 'maternal_child', label: 'Maternal & Child' }
];

const CATEGORY_VISUALS: Record<string, { accent: string; bg: string; img: string; shortType: string }> = {
  antimalarial: { accent: 'text-amber-600 dark:text-amber-400', bg: 'from-amber-50 to-orange-100/70 dark:from-amber-950/40 dark:to-slate-900', img: '/rx_capsule_3d.png', shortType: 'ACT PROTOCOL' },
  antibiotic: { accent: 'text-blue-600 dark:text-blue-400', bg: 'from-blue-50 to-cyan-100/70 dark:from-blue-950/40 dark:to-slate-900', img: '/rx_capsule_3d.png', shortType: 'ANTIMICROBIAL' },
  cardio_diabetes: { accent: 'text-rose-600 dark:text-rose-400', bg: 'from-rose-50 to-pink-100/60 dark:from-rose-950/35 dark:to-slate-900', img: '/rx_capsule_3d.png', shortType: 'CHRONIC CARE' },
  pain_analgesic: { accent: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-50 to-teal-100/60 dark:from-emerald-950/35 dark:to-slate-900', img: '/rx_capsule_3d.png', shortType: 'OTC ESSENTIAL' },
  respiratory: { accent: 'text-cyan-600 dark:text-cyan-400', bg: 'from-cyan-50 to-sky-100/70 dark:from-cyan-950/35 dark:to-slate-900', img: '/rx_capsule_3d.png', shortType: 'AIRWAY CARE' },
  gastro: { accent: 'text-violet-600 dark:text-violet-400', bg: 'from-violet-50 to-indigo-100/60 dark:from-violet-950/35 dark:to-slate-900', img: '/rx_capsule_3d.png', shortType: 'GI RELIEF' },
  maternal_child: { accent: 'text-teal-600 dark:text-teal-400', bg: 'from-teal-50 to-emerald-100/60 dark:from-teal-950/35 dark:to-slate-900', img: '/rx_capsule_3d.png', shortType: 'FAMILY & PEDS' }
};

export const EPharmacyAndMedics: React.FC<EPharmacyAndMedicsProps> = ({
  onNavigate = () => {},
  addToast = () => {},
  user = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('ecopharm');
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('doctorian_epharmacy_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'cart' | 'orders'>('cart');
  const [detailMedicine, setDetailMedicine] = useState<MedicineItem | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [latestConfirmedOrder, setLatestConfirmedOrder] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checkout Form States
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+256 ');
  const [district, setDistrict] = useState('Kampala Central');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'airtel' | 'cash' | 'insurance'>('momo');
  const [prescriptionRef, setPrescriptionRef] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (user?.displayName && !customerName) setCustomerName(user.displayName);
    if (user?.phone && customerPhone === '+256 ') setCustomerPhone(user.phone);
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('doctorian_epharmacy_cart_v1', JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  const loadOrderHistory = async () => {
    const orders = await api.pharmacy.getOrders();
    setRecentOrders(orders);
  };

  useEffect(() => {
    void loadOrderHistory();
  }, []);

  const activePharmacy = useMemo(
    () => UGANDA_PHARMACIES.find((p) => p.id === selectedPharmacyId) || UGANDA_PHARMACIES[0],
    [selectedPharmacyId]
  );

  const filteredMedicines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_CATALOG_MEDICINES.filter((m) => {
      const catOk = selectedCategory === 'all' || m.category === selectedCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.primaryIndication.toLowerCase().includes(q) ||
        m.form.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  const resolvePriceForPharmacy = (med: MedicineItem, pharmId: string) => {
    const branchOffer = med.pharmacyPrices.find((p) => p.pharmacyId === pharmId);
    return branchOffer ? branchOffer.priceUGX : med.priceUGX;
  };

  const addToCart = (med: MedicineItem, overridePharmId?: string, overridePharmName?: string, overridePrice?: number) => {
    const pharmId = overridePharmId || selectedPharmacyId;
    const pharm = UGANDA_PHARMACIES.find((p) => p.id === pharmId) || activePharmacy;
    const price = overridePrice ?? resolvePriceForPharmacy(med, pharmId);

    setCart((prev) => {
      const idx = prev.findIndex((c) => c.medicine.id === med.id && c.selectedPharmacyId === pharmId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          medicine: med,
          qty: 1,
          selectedPharmacyId: pharmId,
          selectedPharmacyName: overridePharmName || pharm.name,
          unitPriceUgx: price
        }
      ];
    });
    addToast(`Added ${med.name} (UGX ${price.toLocaleString()}) to order bag.`, 'success');
  };

  const updateCartQty = (medId: string, pharmId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.medicine.id === medId && c.selectedPharmacyId === pharmId
            ? { ...c, qty: Math.max(0, c.qty + delta) }
            : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  const totalItems = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);
  const subtotalUgx = useMemo(() => cart.reduce((s, c) => s + c.qty * c.unitPriceUgx, 0), [cart]);
  const deliveryFeeUgx = fulfillmentType === 'pickup' || cart.length === 0 ? 0 : subtotalUgx >= 100000 ? 0 : 5000;
  const totalUgx = subtotalUgx + deliveryFeeUgx;
  const requiresRx = useMemo(() => cart.some((c) => c.medicine.prescriptionRequired), [cart]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      addToast('Add at least one medicine before placing an order.', 'warning');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      addToast('Please enter your name and contact phone number.', 'warning');
      return;
    }
    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      addToast('Please provide a delivery street or landmark address.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const dispatchPharm = cart[0]?.selectedPharmacyId || selectedPharmacyId;
      const dispatchPharmName = cart[0]?.selectedPharmacyName || activePharmacy.name;

      const result = await api.pharmacy.submitOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: fulfillmentType === 'pickup' ? `Counter Pickup — ${dispatchPharmName}` : deliveryAddress.trim(),
        district,
        pharmacyId: dispatchPharm,
        pharmacyName: dispatchPharmName,
        fulfillmentType,
        paymentMethod,
        items: cart.map((c) => ({
          id: c.medicine.id,
          name: c.medicine.name,
          dosage: c.medicine.dosage,
          qty: c.qty,
          unitPriceUgx: c.unitPriceUgx,
          prescriptionRequired: c.medicine.prescriptionRequired
        })),
        prescriptionRef: prescriptionRef.trim(),
        notes: orderNotes.trim()
      });

      setLatestConfirmedOrder(result.order);
      setCart([]);
      localStorage.removeItem('doctorian_epharmacy_cart_v1');
      await loadOrderHistory();

      addToast(
        result.offline
          ? `Order #${result.order.orderNumber} saved offline & queued to dispatch on reconnect.`
          : `Order #${result.order.orderNumber} transmitted to ${dispatchPharmName} & Clinical Team!`,
        'success'
      );
    } catch (err: any) {
      addToast(err?.message || 'Unable to submit drug order. Please check details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f7fa] dark:bg-[#050d21] text-slate-900 dark:text-slate-100 pb-28">
      {/* Top Storefront Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#07132c]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                Doctorian E-Pharmacy &amp; Dispensary
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                NDA-Verified Uganda Essential Medicines · Live Clinical Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDrawerTab('orders');
                setIsDrawerOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <History className="w-3.5 h-3.5" />
              <span>Orders ({recentOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDrawerTab('cart');
                setIsDrawerOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-cyan-500 hover:bg-slate-800 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-extrabold transition-colors cursor-pointer shadow-sm whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="tabular-nums">Bag ({totalItems})</span>
              {subtotalUgx > 0 && (
                <span className="hidden md:inline font-mono text-[11px] opacity-90 tabular-nums">
                  · UGX {subtotalUgx.toLocaleString()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Clean Editorial Pharmacy Hero Band */}
        <section className="rounded-3xl bg-gradient-to-br from-[#081a38] via-[#0c2752] to-[#083358] text-white border border-cyan-500/25 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 p-6 sm:p-8 lg:p-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                <ShieldCheck className="w-4 h-4" />
                <span>National Drug Authority Verified Supply · Instant Order Broadcast</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-[1.12] text-white">
                Authentic Medicines Delivered From Trusted Ugandan Pharmacies
              </h2>

              <p className="text-sm sm:text-base text-slate-200/90 max-w-2xl leading-relaxed">
                Compare prices across Ecopharm, Vine, First Pharmacy, C-Care IHK &amp; regional hospital dispensaries. Place orders online or offline—every dispatch syncs directly to clinicians and pharmacy counters.
              </p>

              {/* Search + Pharmacy Selector Bar */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-7 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search drug name, generic, or symptom (e.g. Coartem, malaria)..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/95 text-slate-900 placeholder:text-slate-500 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div className="sm:col-span-5 relative">
                  <Store className="w-4 h-4 text-cyan-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    aria-label="Select Dispensing Pharmacy"
                    value={selectedPharmacyId}
                    onChange={(e) => setSelectedPharmacyId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/95 text-slate-900 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                  >
                    {UGANDA_PHARMACIES.map((pharm) => (
                      <option key={pharm.id} value={pharm.id}>
                        {pharm.name} ({pharm.district})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-cyan-100/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{activePharmacy.hours}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{activePharmacy.mainAddress}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Free delivery orders &gt;= UGX 100,000</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4">
              <div className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 flex items-center gap-4">
                <img
                  src="/rx_hero_banner.png"
                  alt="Verified Medical Dispensary"
                  className="w-24 h-20 rounded-xl object-cover shrink-0 bg-slate-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/rx_capsule_3d.png';
                  }}
                />
                <div className="space-y-1.5 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Clinical Tele-Pharmacist</p>
                  <p className="text-sm font-bold text-white leading-snug">Need a verified prescription before ordering?</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onNavigate('consult')}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-cyan-300 hover:text-white cursor-pointer transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Consult Doctor</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-white/30">·</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('prescriptions')}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-300 hover:text-white cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>My Rx</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Order Confirmation Banner (if order just submitted) */}
        {latestConfirmedOrder && (
          <section className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-700/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                  Order #{latestConfirmedOrder.orderNumber} Transmitted ({latestConfirmedOrder.pharmacyName})
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/90">
                  {latestConfirmedOrder.items?.length || 0} item(s) · Total{' '}
                  <span className="font-mono font-bold tabular-nums">
                    UGX {Number(latestConfirmedOrder.totalUgx ?? latestConfirmedOrder.total_ugx ?? 0).toLocaleString()}
                  </span>{' '}
                  · {latestConfirmedOrder.fulfillmentType === 'pickup' ? 'Ready for counter pickup in ~15 min' : 'Rider dispatch ETA ~40 min'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDrawerTab('orders');
                  setIsDrawerOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                View Receipt
              </button>
              <button
                type="button"
                onClick={() => setLatestConfirmedOrder(null)}
                className="p-2 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer"
                aria-label="Dismiss confirmation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* Clean Category Filter Strip */}
        <section aria-label="Medicine categories" className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_TABS.map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                  active
                    ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 border-slate-900 dark:border-cyan-400 shadow-xs'
                    : 'bg-white dark:bg-[#091834] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </section>

        {/* Strict 3-Column Uniform Retail Medication Grid */}
        <section aria-label="Medication catalog">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Showing {filteredMedicines.length} Verified Medications · Dispensing from {activePharmacy.name}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>

          {filteredMedicines.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#091834] border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <Pill className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">No medicines matched "{searchQuery}"</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try searching by generic compound (e.g., Artemether, Amoxicillin, Paracetamol, Metformin) or switch category above.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                Show All Medicines
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedicines.map((med) => {
                const visual = CATEGORY_VISUALS[med.category] || CATEGORY_VISUALS.pain_analgesic;
                const priceUgx = resolvePriceForPharmacy(med, selectedPharmacyId);
                const inBagQty = cart
                  .filter((c) => c.medicine.id === med.id)
                  .reduce((sum, c) => sum + c.qty, 0);

                return (
                  <article
                    key={med.id}
                    className="group bg-white dark:bg-[#091834] border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:border-blue-400/60 dark:hover:border-cyan-500/45 hover:shadow-lg"
                  >
                    {/* Top Product Stage (>60% clean visual presentation) */}
                    <button
                      type="button"
                      onClick={() => setDetailMedicine(med)}
                      className={`relative w-full aspect-[16/10] bg-gradient-to-br ${visual.bg} p-5 flex items-center justify-center overflow-hidden text-left cursor-pointer border-b border-slate-100 dark:border-slate-800/80`}
                    >
                      <img
                        src={visual.img}
                        alt={med.name}
                        className="w-24 h-24 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo-96.png';
                        }}
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        {visual.shortType}
                      </span>
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {med.prescriptionRequired ? 'Rx Required' : 'OTC Available'}
                      </span>
                    </button>

                    {/* Clean Typography Details + Price + Action */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <p className={`text-[11px] font-bold uppercase tracking-wider ${visual.accent}`}>
                          {med.form} · {med.dosage}
                        </p>
                        <h3
                          onClick={() => setDetailMedicine(med)}
                          className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                        >
                          {med.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {med.genericName} · {med.packSize}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-extrabold font-mono text-slate-900 dark:text-white tabular-nums leading-none">
                            UGX {priceUgx.toLocaleString()}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {med.pharmacyPrices.length} branches · {med.inStock ? 'In stock' : 'Check stock'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(med)}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{inBagQty > 0 ? `Add (${inBagQty})` : 'Add to Order'}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Product Detail & Branch Price Comparison Modal */}
      <AnimatePresence>
        {detailMedicine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDetailMedicine(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white dark:bg-[#091834] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                    {detailMedicine.form} · {detailMedicine.dosage} · {detailMedicine.ndaApproved ? 'NDA Approved' : 'Essential Stock'}
                  </p>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{detailMedicine.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{detailMedicine.genericName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailMedicine(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  aria-label="Close medicine details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 p-4 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Clinical Indication</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{detailMedicine.primaryIndication}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">Pack: {detailMedicine.packSize}</p>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Compare Uganda Pharmacy Branch Prices
                  </p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    {detailMedicine.pharmacyPrices.map((offer) => (
                      <div key={`${detailMedicine.id}-${offer.pharmacyId}`} className="p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-[#0b1d3d]">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">{offer.pharmacyName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{offer.branch} · {offer.inStock ? 'Available now' : 'Backorder'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold font-mono tabular-nums text-slate-900 dark:text-cyan-300">
                            UGX {offer.priceUGX.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(detailMedicine, offer.pharmacyId, offer.pharmacyName, offer.priceUGX);
                              setDetailMedicine(null);
                              setDrawerTab('cart');
                              setIsDrawerOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-Over Order Bag, Checkout & Order Receipt Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[125] bg-slate-950/60 backdrop-blur-sm flex justify-end"
            onClick={() => setIsDrawerOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-[#08142b] h-full flex flex-col border-l border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDrawerTab('cart')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      drawerTab === 'cart'
                        ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Order Bag ({totalItems})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab('orders')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      drawerTab === 'orders'
                        ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Sent Orders ({recentOrders.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {drawerTab === 'cart' ? (
                  <>
                    {cart.length === 0 ? (
                      <div className="py-16 text-center space-y-3">
                        <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Your pharmacy order bag is empty</p>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                          Add essential medicines from the catalog to send a real-time dispatch order to your selected Ugandan pharmacy.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Cart Items */}
                        <div className="space-y-3">
                          {cart.map((item) => (
                            <div
                              key={`${item.medicine.id}-${item.selectedPharmacyId}`}
                              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c1d3d] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                  {item.medicine.name}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {item.selectedPharmacyName} · UGX {item.unitPriceUgx.toLocaleString()} each
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.medicine.id, item.selectedPharmacyId, -1)}
                                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-extrabold font-mono tabular-nums">
                                  {item.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.medicine.id, item.selectedPharmacyId, 1)}
                                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateCartQty(item.medicine.id, item.selectedPharmacyId, -item.qty)}
                                  className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Dispatch & Delivery Form */}
                        <form id="epharmacy-checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setFulfillmentType('delivery')}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-colors ${
                                fulfillmentType === 'delivery'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Home Delivery</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFulfillmentType('pickup')}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition-colors ${
                                fulfillmentType === 'pickup'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <Store className="w-3.5 h-3.5" />
                              <span>Counter Pickup</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Patient / Recipient Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Full name"
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Contact Phone (SMS Dispatch) *
                              </label>
                              <input
                                type="tel"
                                required
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="+256 7XX XXX XXX"
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          {fulfillmentType === 'delivery' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                  District / City
                                </label>
                                <select
                                  value={district}
                                  onChange={(e) => setDistrict(e.target.value)}
                                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                                >
                                  <option>Kampala Central</option>
                                  <option>Wakiso / Entebbe</option>
                                  <option>Lira City</option>
                                  <option>Gulu City</option>
                                  <option>Mbarara City</option>
                                  <option>Jinja City</option>
                                  <option>Mbale City</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                  Street / Ward / Boda Landmark *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={deliveryAddress}
                                  onChange={(e) => setDeliveryAddress(e.target.value)}
                                  placeholder="Plot, street, apartment, or clinic gate"
                                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                          )}

                          {requiresRx && (
                            <div>
                              <label className="block text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1">
                                Clinician Prescription Reference / Notes (Rx Items in Bag)
                              </label>
                              <input
                                type="text"
                                value={prescriptionRef}
                                onChange={(e) => setPrescriptionRef(e.target.value)}
                                placeholder="e.g. RX-MULAGO-2026 or Prescribing Doctor Name"
                                className="w-full px-3 py-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs font-semibold focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Payment Method
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { id: 'momo', label: 'MTN MoMo' },
                                { id: 'airtel', label: 'Airtel Money' },
                                { id: 'cash', label: 'Cash on Delivery' },
                                { id: 'insurance', label: 'Insurance' }
                              ].map((pm) => (
                                <button
                                  key={pm.id}
                                  type="button"
                                  onClick={() => setPaymentMethod(pm.id as any)}
                                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border cursor-pointer transition-colors ${
                                    paymentMethod === pm.id
                                      ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 border-slate-900 dark:border-cyan-400'
                                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                  }`}
                                >
                                  {pm.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Pharmacist Instructions (Optional)
                            </label>
                            <textarea
                              rows={2}
                              value={orderNotes}
                              onChange={(e) => setOrderNotes(e.target.value)}
                              placeholder="Allergies, preferred dosage brand, or delivery timing..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </form>
                      </>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.length === 0 ? (
                      <div className="py-16 text-center space-y-2">
                        <FileText className="w-9 h-9 text-slate-400 mx-auto" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No pharmacy orders recorded yet</p>
                        <p className="text-xs text-slate-500">Confirmed orders and offline queued orders will appear here.</p>
                      </div>
                    ) : (
                      recentOrders.map((ord) => (
                        <div
                          key={ord.orderNumber || ord.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1d3d] border border-slate-200 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold font-mono text-blue-600 dark:text-cyan-400">
                              #{ord.orderNumber || ord.order_number}
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              {ord.status === 'queued_offline' ? <WifiOff className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              <span>{ord.status === 'queued_offline' ? 'Queued Offline' : 'Confirmed & Sent'}</span>
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {ord.pharmacyName || ord.pharmacy_name} · {ord.district}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            {(ord.items || []).map((i: any) => `${i.qty}x ${i.name}`).join(', ')}
                          </p>
                          <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">
                              {new Date(ord.createdAt || ord.created_at || Date.now()).toLocaleString()}
                            </span>
                            <span className="font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                              UGX {Number(ord.totalUgx ?? ord.total_ugx ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Sticky Footer Totals & Send Button */}
              {drawerTab === 'cart' && cart.length > 0 && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#061024] space-y-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Medicines Subtotal</span>
                      <span className="font-mono tabular-nums">UGX {subtotalUgx.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{fulfillmentType === 'pickup' ? 'Counter Pickup' : 'Express Rider Delivery'}</span>
                      <span className="font-mono tabular-nums">
                        {deliveryFeeUgx === 0 ? 'FREE' : `UGX ${deliveryFeeUgx.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>Total Payable</span>
                      <span className="font-mono tabular-nums">UGX {totalUgx.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    form="epharmacy-checkout-form"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Transmitting Drug Order...' : 'Place & Send Drug Order'}</span>
                  </button>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EPharmacyAndMedics;
