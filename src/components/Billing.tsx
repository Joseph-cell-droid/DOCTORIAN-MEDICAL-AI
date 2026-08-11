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
  CreditCard
} from 'lucide-react';
import { api, User } from '../api';
import { openFlutterwavePayment } from '../utils/flutterwave';

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
}

export const Billing: React.FC<BillingProps> = ({ user, onUpdateUser, onShowToast }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('catalyst');
  const [loading, setLoading] = useState(false);

  const currentPlan = PLANS.find(p => p.id === selectedPlan);

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
      <div className="mb-16 text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
          System <span className="text-blue-600 dark:text-blue-400">Scale</span> Integration
        </h2>
        <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400 font-medium">
          Select your neural architecture. Every tier unlocks deeper AI diagnostic capabilities and enhanced bio-twin processing.
        </p>
      </div>

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
  );
};
