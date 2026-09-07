import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Shield, 
  Cpu, 
  Settings, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Plus, 
  QrCode, 
  DollarSign,
  Loader2,
  CreditCard,
  HardDrive,
  Database,
  Server,
  AlertTriangle,
  Check
} from 'lucide-react';
import { api, User } from '../api';
import { openFlutterwavePayment } from '../utils/flutterwave';
import { 
  STORAGE_EXPANSION_PLANS, 
  formatBytes, 
  purchaseStorageExpansion,
  FREE_STORAGE_QUOTA_BYTES
} from '../utils/storageVaultApi';

interface BillingPlan {
  id: string;
  name: string;
  price: string;
  amount: number;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const PLANS: BillingPlan[] = [
  {
    id: 'core',
    name: 'Clinical Core',
    price: '0 UGX',
    amount: 0,
    period: 'Forever',
    description: 'Essential neural monitoring for individual health tracking.',
    features: [
      '400 Neural Energy Units / Month',
      'Advanced Symptom Mapper',
      'Baseline Intelligence Matrix',
      'Clinical Protocol Access',
      'WHO-Aligned Emergency Nodes'
    ]
  },
  {
    id: 'catalyst',
    name: 'Neural Catalyst',
    amount: 50000,
    price: '50,000 UGX',
    period: 'Per Month',
    description: 'Autonomous AI synthesis and specialist network priority.',
    isPopular: true,
    features: [
      '5000+ Neural Energy Units',
      'Unlimited Neural Node Training',
      '3D Organ Bio-Simulation',
      'Priority Clinical Sync Queue',
      'Genetic Marker Analysis',
      'Health Data Export (L1 Logic)'
    ]
  },
  {
    id: 'quantum',
    name: 'Universal Quantum',
    amount: 150000,
    price: '150,000 UGX',
    period: 'Per Month',
    description: 'The ultimate healthcare framework for elite performance.',
    features: [
      'Unlimited Neural Energy Units',
      'Everything in Catalyst',
      'Family Neural Cloud (5 users)',
      'Real-time Concierge MD Sync',
      'Advanced Longevity Suite',
      'Enterprise Clinical API Access'
    ]
  }
];

interface BillingProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  initialTab?: 'protocols' | 'storage';
}

export const Billing: React.FC<BillingProps> = ({ user, onUpdateUser, onShowToast, initialTab }) => {
  const [billingTab, setBillingTab] = useState<'protocols' | 'storage'>(() => {
    if (initialTab) return initialTab;
    if (typeof localStorage !== 'undefined' && localStorage.getItem('doctorian_storage_open_billing') === 'true') {
      localStorage.removeItem('doctorian_storage_open_billing');
      return 'storage';
    }
    return 'protocols';
  });

  React.useEffect(() => {
    if (initialTab) {
      setBillingTab(initialTab);
    }
  }, [initialTab]);
  const [selectedPlan, setSelectedPlan] = useState<string>('catalyst');
  const [loading, setLoading] = useState(false);

  // Cloud Storage Expansion States
  const [selectedStoragePlan, setSelectedStoragePlan] = useState<string>('storage_20gb');
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageMomoPhone, setStorageMomoPhone] = useState(user?.phone || '');
  const [storagePaymentMethod, setStoragePaymentMethod] = useState<'momo' | 'flutterwave'>('momo');
  const [storageSuccessMessage, setStorageSuccessMessage] = useState<string | null>(null);

  const currentPlan = PLANS.find(p => p.id === selectedPlan);
  const currentStoragePlan = STORAGE_EXPANSION_PLANS.find(p => p.id === selectedStoragePlan) || STORAGE_EXPANSION_PLANS[1];

  const handleStoragePurchase = async () => {
    if (!user) {
      onShowToast("Please log in to purchase storage", "error");
      return;
    }
    const plan = currentStoragePlan;
    if (storagePaymentMethod === 'momo' && (!storageMomoPhone || storageMomoPhone.length < 9)) {
      onShowToast("Please enter a valid MTN MoMo phone number", "error");
      return;
    }

    setStorageLoading(true);
    setStorageSuccessMessage(null);
    try {
      if (storagePaymentMethod === 'flutterwave') {
        openFlutterwavePayment({
          public_key: (import.meta as any).env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOX-KEY',
          tx_ref: `STORE-${Date.now()}`,
          amount: plan.amount,
          currency: 'UGX',
          payment_options: 'card,mobilemoneyuganda,ussd',
          customer: {
            email: user?.email || 'patient@medical-ai.studio',
            phone_number: storageMomoPhone || '',
            name: user?.displayName || 'Valued Patient',
          },
          customizations: {
            title: 'Cloud Storage Expansion',
            description: `Activation of +${plan.formattedSize} storage quota`,
            logo: 'https://medical-ai.studio/logo.svg',
          },
          callback: async (response: any) => {
            if (response.status === "successful" || response.status === "completed") {
              const res = await purchaseStorageExpansion(
                '',
                selectedStoragePlan,
                'flutterwave',
                storageMomoPhone,
                response.transaction_id.toString(),
                user.email
              );
              setStorageSuccessMessage(res.message);
              onShowToast(res.message, "success");
            }
          },
          onclose: () => {
            setStorageLoading(false);
          }
        });
      } else {
        const res = await purchaseStorageExpansion(
          '',
          selectedStoragePlan,
          'momo',
          storageMomoPhone,
          `TX-MOMO-${Date.now()}`,
          user.email
        );
        setStorageSuccessMessage(res.message);
        onShowToast(res.message, "success");
      }
    } catch (err: any) {
      onShowToast(err.message || "Storage purchase failed", "error");
    } finally {
      setStorageLoading(false);
    }
  };

  const config = {
    public_key: (import.meta as any).env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOX-KEY',
    tx_ref: `MEDICAL-${Date.now()}`,
    amount: currentPlan?.amount || 0,
    currency: 'UGX',
    payment_options: 'card,mobilemoneyuganda,ussd',
    customer: {
      email: user?.email || 'guest@medical-ai.studio',
      phone_number: user?.email ? '' : '', // Could be enriched
      name: user?.displayName || 'Valued Patient',
    },
    customizations: {
      title: 'Doctorian Protocol',
      description: `Activation of ${currentPlan?.name} Neural Framework`,
      logo: 'https://medical-ai.studio/logo.svg',
    },
  };

  // Flutterwave payment configuration
  const triggerFlutterwave = () => {
    openFlutterwavePayment({
      ...config,
      callback: async (response: any) => {
        if (response.status === "successful" || response.status === "completed") {
          await processSubscription(response.transaction_id.toString());
        }
      },
      onclose: () => {
        setLoading(false);
      }
    });
  };

  const [momoPhone, setMomoPhone] = useState(user?.phone || '');
  const [showMomo, setShowMomo] = useState(false);

  const handleMTNPayment = async () => {
    if (!user) {
      onShowToast("Please authenticate to activate protocols", "error");
      return;
    }

    if (!momoPhone || momoPhone.length < 9) {
      onShowToast("Please enter a valid MTN MoMo phone number", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/billing/mtn-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          tier: selectedPlan,
          phone: momoPhone,
          amount: currentPlan?.amount || 0,
          currency: 'UGX'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payment failed");

      onShowToast(data.message, "success");
      setShowMomo(false);
    } catch (err: any) {
      onShowToast(err.message || "Failed to initialize MTN MoMo payment", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      onShowToast("Please authenticate to activate protocols", "error");
      return;
    }

    if (currentPlan?.id === 'core') {
      processSubscription("FREE-TX-REF");
      return;
    }

    // Default to show MoMo option instead of direct redirect if requested
    setShowMomo(true);
  };

  const processSubscription = async (txId?: string) => {
    setLoading(true);
    try {
      await api.billing.subscribe(selectedPlan, txId);
      onShowToast(`System protocol ${currentPlan?.name} initialized!`, "success");
      const updatedUser = await api.auth.me();
      onUpdateUser(updatedUser);
    } catch (err: any) {
      onShowToast(err.message || "Protocol activation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showMethods, setShowMethods] = useState(false);

  const fetchMethods = async () => {
    try {
      const data = await api.billing.getPaymentMethods();
      setPaymentMethods(data?.data || []);
      setShowMethods(true);
    } catch (err) {
      onShowToast("Failed to fetch available payment methods", "error");
    }
  };

  const isCurrentTier = (planId: string) => {
    if (!user) return false;
    const tierMap: Record<string, string> = {
      'core': 'free',
      'catalyst': 'pro',
      'quantum': 'enterprise'
    };
    return user.subscriptionTier === tierMap[planId];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
          System <span className="text-blue-600 dark:text-blue-400">Scale</span> & Storage Integration
        </h2>
        <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400 font-medium">
          Select your neural architecture or expand your 1GB free cloud vault. Storage purchases activate instantly upon quota exhaustion.
        </p>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-10 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setBillingTab('protocols')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            billingTab === 'protocols'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Neural Diagnostics & Protocols</span>
        </button>
        <button
          onClick={() => setBillingTab('storage')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            billingTab === 'storage'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Cloud Storage Expansion (1GB+ Quota)</span>
          <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-500 text-white font-black uppercase tracking-wider">
            Auto-Billing
          </span>
        </button>
      </div>

      {billingTab === 'storage' ? (
        /* =================================================================== */
        /* CLOUD STORAGE EXPANSION PLANS VIEW                                  */
        /* =================================================================== */
        <div className="space-y-10">
          {/* Storage Alert & Status Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-500/10 via-indigo-500/10 to-purple-500/10 border border-rose-300 dark:border-rose-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Automatic Storage Purchase Hub</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Free 1GB Quota Full? Expand Your Cloud Space
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                Every registered account receives 1.00 GB of free encrypted storage. When your files fill up your allocation,
                purchased expansions are attached directly to your account with zero downtime.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
              <Server className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Account Quota</p>
                <p className="text-xs font-black text-slate-900 dark:text-white">1GB Base + Expansions</p>
              </div>
            </div>
          </div>

          {/* Storage Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STORAGE_EXPANSION_PLANS.map((plan) => {
              const isSelected = selectedStoragePlan === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedStoragePlan(plan.id)}
                  className={`cursor-pointer relative p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-4 right-4 bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      Recommended
                    </div>
                  )}

                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 font-black">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">{plan.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{plan.description}</p>

                    <div className="mb-6 flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {plan.amount.toLocaleString()} UGX
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">{plan.period}</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Tier Selected' : 'Choose Pack'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Storage Checkout Container */}
          <div className="bg-slate-900 dark:bg-slate-800 text-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 mb-6 backdrop-blur-md">
                  <Shield size={16} className="text-rose-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Storage Allocation</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
                  Instant Vault Expansion
                </h3>
                <p className="text-slate-400 font-medium mb-6 leading-relaxed max-w-md">
                  Pay with MTN MoMo or International Card. Quota upgrades immediately take effect on your 2FA protected account storage vault.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span>Real Cloud Quota</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>End-to-End Encrypted</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Storage Summary</p>
                  <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-black">{currentStoragePlan.name}</h4>
                    <span className="text-2xl font-black text-rose-400">
                      {currentStoragePlan.amount.toLocaleString()} UGX
                    </span>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Quota Added</span>
                    <span className="text-white font-mono">+{currentStoragePlan.formattedSize}</span>
                  </div>
                </div>

                {/* Gateway Switch */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Payment Gateway
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStoragePaymentMethod('momo')}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                        storagePaymentMethod === 'momo'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      MTN MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setStoragePaymentMethod('flutterwave')}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                        storagePaymentMethod === 'flutterwave'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Card / Flutterwave
                    </button>
                  </div>
                </div>

                {storagePaymentMethod === 'momo' && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      MTN Mobile Money Number
                    </label>
                    <input
                      type="tel"
                      value={storageMomoPhone}
                      onChange={(e) => setStorageMomoPhone(e.target.value)}
                      placeholder="e.g. 077XXXXXXX"
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStoragePurchase}
                  disabled={storageLoading}
                  className="w-full py-5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {storageLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Authorize +{currentStoragePlan.formattedSize} Storage</span>
                    </>
                  )}
                </button>

                {storageSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{storageSuccessMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* NEURAL DIAGNOSTICS & CLINICAL PROTOCOLS VIEW                         */
        /* =================================================================== */
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {PLANS.map((plan, mapIdx_233) => (
              <motion.div
                key={`billing-l236-${mapIdx_233}`}
                whileHover={{ y: -8 }}
                className={`relative p-8 rounded-[2.5rem] border ${
                  selectedPlan === plan.id 
                    ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-2xl shadow-blue-500/10' 
                    : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                } transition-all duration-300 overflow-hidden group`}
              >
                {plan.isPopular && (
                  <div className="absolute top-6 right-6 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/20">
                    Optimal
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{plan.description}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={`billing-l262-i-${i}`} className="flex gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => setSelectedPlan(plan.id)}
                  disabled={isCurrentTier(plan.id)}
                  className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                    isCurrentTier(plan.id)
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800'
                      : selectedPlan === plan.id 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {isCurrentTier(plan.id) ? (
                    <>
                      <CheckCircle2 size={14} /> Active Framework
                    </>
                  ) : selectedPlan === plan.id ? 'Protocol Selected' : 'Review Tier'}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-900 dark:bg-slate-800 text-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 mb-8 backdrop-blur-md">
                  <Shield size={16} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Interface</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">Secure Neural <br/>Payment Gateway</h2>
                <p className="text-slate-400 font-medium mb-8 leading-relaxed max-w-md">
                  Process your activation via Flutterwave's enterprise-grade infrastructure. Payments are handled via specialized neural encryption.
                </p>
                
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <Lock size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">256-bit AES</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <DollarSign size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Instant Sync</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Auto-Activation</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10">
                <div className="mb-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Order Summary</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black">{currentPlan?.name}</h3>
                    <span className="text-3xl font-black text-blue-400">{currentPlan?.price}</span>
                  </div>
                  <div className="h-px bg-white/10 my-6" />
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Protocol Activation</span>
                      <span className="text-white">Included</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Neural Processing</span>
                      <span className="text-white">Active</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showMomo ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">MTN MoMo Number</label>
                      <input 
                        type="tel" 
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value)}
                        placeholder="e.g. 077XXXXXXX"
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-white placeholder:text-slate-600"
                      />
                      <div className="flex gap-3">
                        <button 
                          onClick={handleMTNPayment}
                          disabled={loading}
                          className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20"
                        >
                          {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Payment'}
                        </button>
                        <button 
                          onClick={() => setShowMomo(false)}
                          className="px-6 py-5 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          Bail
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={handleSubscribe}
                      disabled={loading || isCurrentTier(selectedPlan)}
                      className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : isCurrentTier(selectedPlan) ? (
                        <> <CheckCircle2 size={18} /> Protocol Active</>
                      ) : (
                        <> <Zap size={18} /> Initialize Fusion</>
                      )}
                    </button>
                  )}
                </AnimatePresence>
                
                <p className="text-center mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                  <CreditCard size={12} /> Billed via MTN MoMo / Flutterwave
                </p>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <button 
                    onClick={fetchMethods}
                    className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors"
                    id="view-methods-btn"
                  >
                    Display Supported Payment Nodes
                  </button>
                  
                  <AnimatePresence>
                    {showMethods && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 grid grid-cols-2 gap-2"
                      >
                        {paymentMethods.map((method, idx) => (
                          <div key={`billing-l417-idx-${idx}`} className="p-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                            {method.name}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
