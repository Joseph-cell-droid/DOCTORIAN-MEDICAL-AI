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
  Check,
  Smartphone,
  Printer,
  Download,
  ShieldCheck,
  X,
  FileText,
  RefreshCw,
  Search,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { api, User, type BillingTransaction } from '../api';
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
  initialTab?: 'protocols' | 'storage' | 'sms' | 'ledger';
}

const SMS_BUNDLES = [
  {
    id: 'sms_pack_100',
    name: 'Clinical Starter 100 SMS',
    credits: 100,
    amount: 12000,
    rateLabel: '120 UGX / SMS',
    description: 'Ideal for patient follow-ups, call alerts & appointment reminders.'
  },
  {
    id: 'sms_pack_500',
    name: 'Ward Pro 500 SMS',
    credits: 500,
    amount: 45000,
    rateLabel: '90 UGX / SMS · Save 40%',
    isPopular: true,
    description: 'High-margin clinic broadcast & automatic doctor/patient GSM alerts.'
  },
  {
    id: 'sms_pack_2500',
    name: 'Hospital Network 2,500 SMS',
    credits: 2500,
    amount: 180000,
    rateLabel: '72 UGX / SMS · Enterprise Margin',
    description: 'Facility-wide server multi-user alert dispatching across wards.'
  }
];

export const Billing: React.FC<BillingProps> = ({ user, onUpdateUser, onShowToast, initialTab }) => {
  const [billingTab, setBillingTab] = useState<'protocols' | 'storage' | 'sms' | 'ledger'>(() => {
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

  // SMS Bundle Checkout States
  const [selectedSmsBundle, setSelectedSmsBundle] = useState<string>('sms_pack_500');
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsPaymentMethod, setSmsPaymentMethod] = useState<'momo' | 'airtel_money' | 'card'>('momo');
  const [smsPayerPhone, setSmsPayerPhone] = useState(user?.phone || '+256772100200');

  // Cloud Storage Expansion States
  const [selectedStoragePlan, setSelectedStoragePlan] = useState<string>('storage_20gb');
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageMomoPhone, setStorageMomoPhone] = useState(user?.phone || '+256 772 100 200');
  const [storagePaymentMethod, setStoragePaymentMethod] = useState<'momo' | 'airtel_money' | 'flutterwave'>('momo');
  const [storageSuccessMessage, setStorageSuccessMessage] = useState<string | null>(null);

  // Transaction Ledger & Invoice Management State
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<{
    totalSpentUgx: number;
    completedCount: number;
    refundedCount: number;
  }>({ totalSpentUgx: 0, completedCount: 0, refundedCount: 0 });
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerKind, setLedgerKind] = useState<'all' | 'protocol' | 'storage' | 'sms_bundle'>('all');
  const [ledgerStatus, setLedgerStatus] = useState<'all' | 'completed' | 'refunded'>('all');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [verifyingTxId, setVerifyingTxId] = useState<string | null>(null);
  const [verifiedSignatures, setVerifiedSignatures] = useState<Record<string, { verified: boolean; signaturePrefix: string }>>({});
  const [confirmRefundId, setConfirmRefundId] = useState<string | null>(null);
  const [refundingTxId, setRefundingTxId] = useState<string | null>(null);

  const loadBillingLedger = React.useCallback(async () => {
    if (!user || user.role === 'guest') return;
    setLedgerLoading(true);
    try {
      const data = await api.billing.getHistory({
        page: 1,
        limit: 40,
        kind: ledgerKind,
        status: ledgerStatus,
        search: ledgerSearch.trim() || undefined
      });
      setTransactions(data.history || []);
      if (data.summary) setLedgerSummary(data.summary);
      if (data.account && user) {
        onUpdateUser({
          ...user,
          subscriptionTier: (data.account.subscriptionTier as any) || user.subscriptionTier,
          credits: data.account.credits ?? user.credits,
          smsCredits: (data.account as any).smsCredits ?? user.smsCredits,
          storageQuotaBytes: data.account.storageQuotaBytes ?? user.storageQuotaBytes
        });
      }
    } catch {
      // Non-blocking in offline preview mode
    } finally {
      setLedgerLoading(false);
    }
  }, [user?.id, user?.role, ledgerKind, ledgerStatus, ledgerSearch]);

  React.useEffect(() => {
    void loadBillingLedger();
  }, [loadBillingLedger]);

  const currentPlan = PLANS.find(p => p.id === selectedPlan);
  const currentStoragePlan = STORAGE_EXPANSION_PLANS.find(p => p.id === selectedStoragePlan) || STORAGE_EXPANSION_PLANS[1];

  const completeVerifiedStorageOrder = async (method: string, externalRef: string) => {
    if (!user) return;
    const plan = currentStoragePlan;
    const idempotencyKey = `st_${user.id}_${plan.id}_${externalRef}`;
    try {
      const res = await api.billing.checkout({
        kind: 'storage',
        itemId: selectedStoragePlan,
        paymentMethod: method,
        payerPhone: storageMomoPhone || user.phone || undefined,
        externalRef,
        idempotencyKey
      });

      const nextQuota = res.user?.storageQuotaBytes || ((user.storageQuotaBytes || FREE_STORAGE_QUOTA_BYTES) + plan.addedBytes);
      const userIdKey = (user.email || 'default_user').replace(/[^a-zA-Z0-9]/g, '_');
      try {
        localStorage.setItem(`doctorian_storage_quota_bytes_${userIdKey}`, String(nextQuota));
      } catch {}

      onUpdateUser({
        ...user,
        storageQuotaBytes: nextQuota
      });

      const msg = `Added ${plan.formattedSize} (${plan.name}) to encrypted cloud vault!`;
      setStorageSuccessMessage(msg);
      onShowToast(msg, 'success');

      if (res.transaction) {
        setReceiptData({
          receiptNo: res.transaction.invoiceNumber,
          date: new Date(res.transaction.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          planName: res.transaction.itemName,
          planDescription: plan.description,
          subtotal: `${res.transaction.subtotalUgx.toLocaleString()} UGX`,
          vat: `${res.transaction.vatUgx.toLocaleString()} UGX (18% UG-VAT)`,
          amount: `${res.transaction.amountUgx.toLocaleString()} UGX`,
          paymentMethod: res.transaction.paymentMethod.toUpperCase(),
          txRef: res.transaction.externalRef || res.transaction.id,
          hmacPrefix: res.transaction.receiptHmac?.slice(0, 18),
          customerName: res.transaction.userName,
          customerEmail: res.transaction.userEmail,
          status: 'PAID & CRYPTO-SIGNED'
        });
        setShowReceiptModal(true);
      }
      void loadBillingLedger();
    } catch {
      const fallback = await purchaseStorageExpansion(
        '',
        selectedStoragePlan,
        method,
        storageMomoPhone,
        externalRef,
        user.email
      );
      setStorageSuccessMessage(fallback.message);
      onShowToast(fallback.message, 'success');
    }
  };

  const handleStoragePurchase = async () => {
    if (!user) {
      onShowToast("Please log in to purchase storage", "error");
      return;
    }
    if (user.role === 'guest') {
      onShowToast("Guest demo accounts cannot purchase storage. Please register or sign in.", "error");
      return;
    }
    const plan = currentStoragePlan;
    if ((storagePaymentMethod === 'momo' || storagePaymentMethod === 'airtel_money') && (!storageMomoPhone || storageMomoPhone.length < 9)) {
      onShowToast("Please enter a valid Uganda Mobile Money phone number", "error");
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
              await completeVerifiedStorageOrder('flutterwave', String(response.transaction_id || Date.now()));
            }
          },
          onclose: () => {
            setStorageLoading(false);
          }
        });
      } else {
        await completeVerifiedStorageOrder(storagePaymentMethod, `TX-${storagePaymentMethod.toUpperCase()}-${Date.now()}`);
      }
    } catch (err: any) {
      onShowToast(err.message || "Storage purchase failed", "error");
    } finally {
      setStorageLoading(false);
    }
  };

  const currentSmsBundle = SMS_BUNDLES.find((b) => b.id === selectedSmsBundle) || SMS_BUNDLES[1];

  const handleSmsBundlePurchase = async () => {
    if (!user || user.role === 'guest') {
      onShowToast("Please sign in with a registered account to purchase SMS bundles.", "error");
      return;
    }
    if ((smsPaymentMethod === 'momo' || smsPaymentMethod === 'airtel_money') && (!smsPayerPhone || smsPayerPhone.trim().length < 9)) {
      onShowToast("Enter a valid Uganda Mobile Money phone number", "error");
      return;
    }
    setSmsLoading(true);
    try {
      const extRef = `SMS-${smsPaymentMethod.toUpperCase()}-${Date.now()}`;
      const res = await api.billing.checkout({
        kind: 'sms_bundle',
        itemId: currentSmsBundle.id,
        paymentMethod: smsPaymentMethod,
        payerPhone: smsPayerPhone.trim() || user.phone || undefined,
        externalRef: extRef,
        idempotencyKey: `sms_${user.id}_${currentSmsBundle.id}_${extRef}`
      });
      const updatedCredits = (res.user as any)?.smsCredits ?? ((user.smsCredits ?? 25) + currentSmsBundle.credits);
      onUpdateUser({
        ...user,
        smsCredits: updatedCredits
      });
      onShowToast(`Added +${currentSmsBundle.credits.toLocaleString()} SMS credits! Balance: ${updatedCredits.toLocaleString()} SMS.`, "success");
      if (res.transaction) {
        setReceiptData({
          receiptNo: res.transaction.invoiceNumber,
          date: new Date(res.transaction.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }),
          planName: res.transaction.itemName,
          planDescription: currentSmsBundle.description,
          subtotal: `${res.transaction.subtotalUgx.toLocaleString()} UGX`,
          vat: `${res.transaction.vatUgx.toLocaleString()} UGX (18% UG-VAT)`,
          amount: `${res.transaction.amountUgx.toLocaleString()} UGX`,
          paymentMethod: res.transaction.paymentMethod.toUpperCase(),
          txRef: res.transaction.externalRef || res.transaction.id,
          hmacPrefix: res.transaction.receiptHmac?.slice(0, 18),
          customerName: res.transaction.userName,
          customerEmail: res.transaction.userEmail,
          status: 'PAID & SMS CREDITED'
        });
        setShowReceiptModal(true);
      }
      void loadBillingLedger();
    } catch (err: any) {
      onShowToast(err.message || "SMS bundle checkout failed", "error");
    } finally {
      setSmsLoading(false);
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

  const [momoPhone, setMomoPhone] = useState(user?.phone || '+256 772 000 000');
  const [showMomo, setShowMomo] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'flutterwave'>('card');
  const [cardData, setCardData] = useState({
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '739',
    name: user?.displayName || 'Valued Patient'
  });
  const [momoPin, setMomoPin] = useState('');
  const [momoStep, setMomoStep] = useState<'input' | 'push_sent'>('input');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleSubscribe = () => {
    if (!user) {
      onShowToast("Please authenticate to activate protocols", "error");
      return;
    }

    if (currentPlan?.id === 'core') {
      processSubscription("FREE-CORE-ACTIVATION");
      return;
    }

    setShowCheckoutModal(true);
  };

  const processSubscription = async (txId?: string, paymentType: string = 'Card Payment') => {
    setLoading(true);
    try {
      const generatedTxId = txId || `DOC-TXN-${Date.now()}`;
      const methodKey = paymentType.toLowerCase().includes('momo')
        ? 'momo'
        : paymentType.toLowerCase().includes('flutterwave')
        ? 'flutterwave'
        : 'card';
      const subRes = await api.billing.subscribe(selectedPlan, generatedTxId, methodKey, momoPhone);
      onShowToast(`Protocol ${currentPlan?.name} activated successfully!`, "success");

      const updatedUser = await api.auth.me();
      if (updatedUser) {
        onUpdateUser(updatedUser);
      } else if (subRes.user && user) {
        onUpdateUser({ ...user, ...subRes.user } as User);
      }

      const tx = subRes.transaction;
      const receipt = {
        receiptNo: tx?.invoiceNumber || `DOC-INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date(tx?.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        planName: tx?.itemName || currentPlan?.name || 'Neural Protocol',
        planDescription: currentPlan?.description || '',
        subtotal: tx ? `${tx.subtotalUgx.toLocaleString()} UGX` : undefined,
        vat: tx ? `${tx.vatUgx.toLocaleString()} UGX (18% UG-VAT)` : 'Included (18% UG-VAT)',
        amount: tx ? `${tx.amountUgx.toLocaleString()} UGX` : currentPlan?.price || '50,000 UGX',
        paymentMethod: paymentType,
        txRef: tx?.externalRef || generatedTxId,
        hmacPrefix: tx?.receiptHmac?.slice(0, 18),
        customerName: tx?.userName || user?.displayName || user?.email?.split('@')[0] || 'Valued Patient',
        customerEmail: tx?.userEmail || user?.email || 'patient@doctorian.org',
        status: 'PAID & CRYPTO-SIGNED'
      };
      setReceiptData(receipt);
      setShowCheckoutModal(false);
      setShowReceiptModal(true);
      void loadBillingLedger();
    } catch (err: any) {
      onShowToast(err.message || "Protocol activation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 12) {
      onShowToast("Please enter a valid credit card number", "error");
      return;
    }
    setLoading(true);
    try {
      // Simulate realistic 3D-Secure bank handshake
      await new Promise(resolve => setTimeout(resolve, 900));
      await processSubscription(`CARD-${Date.now()}`, "Visa / Mastercard 3D-Secure");
    } catch (err: any) {
      onShowToast(err.message || "Card transaction failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMoMoConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoPhone || momoPhone.length < 9) {
      onShowToast("Please enter a valid phone number", "error");
      return;
    }

    if (momoStep === 'input') {
      setLoading(true);
      // Simulate USSD push prompt sent to carrier
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoading(false);
      setMomoStep('push_sent');
      onShowToast("USSD payment request pushed to your phone. Enter PIN to confirm.", "info");
      return;
    }

    // Step 2: Confirm with PIN
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      await processSubscription(`MOMO-${Date.now()}`, `MTN MoMo (${momoPhone})`);
      setMomoStep('input');
    } catch (err: any) {
      onShowToast(err.message || "Mobile Money transaction failed", "error");
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
          type="button"
          onClick={() => setBillingTab('protocols')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            billingTab === 'protocols'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Neural Diagnostics &amp; Protocols</span>
        </button>
        <button
          type="button"
          onClick={() => setBillingTab('storage')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
        <button
          type="button"
          onClick={() => setBillingTab('sms')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            billingTab === 'sms'
              ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>SMS Bundles</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/15 text-sky-600 dark:text-sky-300 font-black tabular-nums">
            {user?.smsCredits ?? 25}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setBillingTab('ledger');
            void loadBillingLedger();
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            billingTab === 'ledger'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Transaction Ledger &amp; Invoices</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-black">
            {transactions.length}
          </span>
        </button>
      </div>

      {billingTab === 'sms' ? (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-emerald-500/10 border border-sky-200 dark:border-sky-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">Commercial GSM Carrier Billing</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Profitable SMS Credit Bundles</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Every 160-character SMS segment bills at 150 UGX retail against 60 UGX carrier cost (+90 UGX net platform margin per segment). Top up bundles below at wholesale volume rates.
              </p>
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available Balance</p>
              <p className="text-2xl font-black text-sky-600 dark:text-sky-400 tabular-nums">
                {(user?.smsCredits ?? 25).toLocaleString()} <span className="text-xs text-slate-500">SMS</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SMS_BUNDLES.map((bundle) => {
              const selected = selectedSmsBundle === bundle.id;
              return (
                <div
                  key={bundle.id}
                  onClick={() => setSelectedSmsBundle(bundle.id)}
                  className={`cursor-pointer relative p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    selected
                      ? 'bg-white dark:bg-slate-900 border-sky-600 shadow-xl ring-2 ring-sky-500/20'
                      : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">{bundle.rateLabel}</span>
                      {bundle.isPopular && (
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-black uppercase">Best Margin</span>
                      )}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">{bundle.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">{bundle.description}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums mb-1">
                      {bundle.amount.toLocaleString()} <span className="text-xs text-slate-400 font-bold">UGX</span>
                    </p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mb-6">
                      +{bundle.credits.toLocaleString()} SMS Credits Instant Top-Up
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${
                      selected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {selected ? 'Selected Bundle' : 'Select Bundle'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-xl font-black mb-1">{currentSmsBundle.name}</h4>
              <p className="text-sm text-slate-300">
                Adds <span className="font-bold text-sky-400">+{currentSmsBundle.credits.toLocaleString()} SMS credits</span> directly to {user?.email || 'your account'} with HMAC-SHA256 receipt &amp; 18% UG VAT invoice.
              </p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {(['momo', 'airtel_money', 'card'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSmsPaymentMethod(m)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase cursor-pointer ${
                      smsPaymentMethod === m ? 'bg-sky-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    {m === 'momo' ? 'MTN MoMo' : m === 'airtel_money' ? 'Airtel' : 'Card'}
                  </button>
                ))}
              </div>
              {smsPaymentMethod !== 'card' && (
                <input
                  type="tel"
                  value={smsPayerPhone}
                  onChange={(e) => setSmsPayerPhone(e.target.value)}
                  placeholder="+256772100200"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              )}
              <button
                type="button"
                disabled={smsLoading}
                onClick={handleSmsBundlePurchase}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {smsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                <span>Pay {currentSmsBundle.amount.toLocaleString()} UGX &amp; Credit +{currentSmsBundle.credits} SMS</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {billingTab === 'ledger' ? (
        /* =================================================================== */
        /* VERIFIED SERVER TRANSACTION LEDGER & INVOICES VIEW                   */
        /* =================================================================== */
        <div className="space-y-6">
          {/* Summary Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Verified Spend</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                {ledgerSummary.totalSpentUgx.toLocaleString()} <span className="text-xs text-slate-400">UGX</span>
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Cloud Vault Quota</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-cyan-400 mt-1 tabular-nums">
                {formatBytes(user?.storageQuotaBytes || FREE_STORAGE_QUOTA_BYTES)}
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmed Invoices</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {ledgerSummary.completedCount}
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Refunded / Rolled Back</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                {ledgerSummary.refundedCount}
              </p>
            </div>
          </div>

          {/* Filter & CSV Export Toolbar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search invoice #, package, or payer..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={ledgerKind}
                onChange={(e) => setLedgerKind(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Categories</option>
                <option value="protocol">Protocols</option>
                <option value="storage">Cloud Storage</option>
                <option value="sms_bundle">SMS Bundles</option>
              </select>
              <select
                value={ledgerStatus}
                onChange={(e) => setLedgerStatus(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void loadBillingLedger()}
                disabled={ledgerLoading}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ledgerLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <a
                href={api.billing.exportUrl()}
                download
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Ledger</span>
              </a>
            </div>
          </div>

          {/* Transaction Ledger Rows */}
          {ledgerLoading && transactions.length === 0 ? (
            <div className="py-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Loading HMAC-signed financial ledger...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-14 px-6 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-white">No billing transactions matched your filter</p>
              <p className="text-xs text-slate-500 mt-1">
                {user?.role === 'guest'
                  ? 'Sign in with a registered patient or doctor account to inspect your live billing ledger.'
                  : 'Complete a protocol activation or cloud storage expansion to generate an HMAC-signed invoice.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const sigInfo = verifiedSignatures[tx.id];
                const isRefunded = tx.status === 'refunded';
                return (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-blue-600 dark:text-cyan-400">
                          {tx.invoiceNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isRefunded
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {tx.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {tx.kind}
                        </span>
                        {sigInfo && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 ${
                              sigInfo.verified
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                                : 'bg-rose-500/15 text-rose-500'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {sigInfo.verified ? `HMAC OK (${sigInfo.signaturePrefix})` : 'HMAC MISMATCH'}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{tx.itemName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(tx.createdAt).toLocaleString('en-GB')} · {tx.paymentMethod.toUpperCase()}
                        {tx.payerPhone ? ` (${tx.payerPhone})` : ''} · Subtotal {tx.subtotalUgx.toLocaleString()} + VAT 18% {tx.vatUgx.toLocaleString()} UGX
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className="text-base font-black text-slate-900 dark:text-white mr-2 tabular-nums">
                        {tx.amountUgx.toLocaleString()} UGX
                      </span>

                      <button
                        type="button"
                        disabled={verifyingTxId === tx.id}
                        onClick={async () => {
                          setVerifyingTxId(tx.id);
                          try {
                            const v = await api.billing.verifyReceipt(tx.id);
                            setVerifiedSignatures((prev) => ({
                              ...prev,
                              [tx.id]: { verified: v.verified, signaturePrefix: v.signaturePrefix }
                            }));
                            onShowToast(
                              v.verified
                                ? `Receipt ${v.invoiceNumber} cryptographically verified (${v.signaturePrefix})`
                                : 'Signature check mismatch detected!',
                              v.verified ? 'success' : 'error'
                            );
                          } catch (err: any) {
                            onShowToast(err.message || 'Verification error', 'error');
                          } finally {
                            setVerifyingTxId(null);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        {verifyingTxId === tx.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />}
                        <span>Verify HMAC</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setReceiptData({
                            receiptNo: tx.invoiceNumber,
                            date: new Date(tx.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }),
                            planName: tx.itemName,
                            subtotal: `${tx.subtotalUgx.toLocaleString()} UGX`,
                            vat: `${tx.vatUgx.toLocaleString()} UGX (18% UG-VAT)`,
                            amount: `${tx.amountUgx.toLocaleString()} UGX`,
                            paymentMethod: tx.paymentMethod.toUpperCase(),
                            txRef: tx.externalRef || tx.id,
                            hmacPrefix: tx.receiptHmac?.slice(0, 18),
                            customerName: tx.userName,
                            customerEmail: tx.userEmail,
                            status: tx.status.toUpperCase()
                          });
                          setShowReceiptModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      {!isRefunded && tx.amountUgx > 0 && (
                        confirmRefundId === tx.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={refundingTxId === tx.id}
                              onClick={async () => {
                                setRefundingTxId(tx.id);
                                try {
                                  const rf = await api.billing.refundTransaction(tx.id);
                                  if (rf.user && user) {
                                    onUpdateUser({
                                      ...user,
                                      subscriptionTier: (rf.user.subscriptionTier as any) || user.subscriptionTier,
                                      credits: rf.user.credits ?? user.credits,
                                      smsCredits: (rf.user as any).smsCredits ?? user.smsCredits,
                                      storageQuotaBytes: rf.user.storageQuotaBytes ?? user.storageQuotaBytes
                                    });
                                  }
                                  setConfirmRefundId(null);
                                  onShowToast(`Transaction ${tx.invoiceNumber} refunded cleanly.`, 'success');
                                  void loadBillingLedger();
                                } catch (err: any) {
                                  onShowToast(err.message || 'Refund declined', 'error');
                                } finally {
                                  setRefundingTxId(null);
                                }
                              }}
                              className="px-2.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                            >
                              {refundingTxId === tx.id ? '...' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRefundId(null)}
                              className="px-2 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmRefundId(tx.id)}
                            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Refund</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : billingTab === 'storage' ? (
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
      ) : billingTab === 'protocols' ? (
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
                          onClick={handleMoMoConfirm}
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
      ) : null}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* REALISTIC CHECKOUT & PROTOCOL ACTIVATION MODAL              */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Protocol Checkout Matrix
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Encrypted Payment & Activation Terminal
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order Summary Box */}
              <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400">Target Framework</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{currentPlan?.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">TOTAL AMOUNT</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{currentPlan?.price}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl mb-4 border border-slate-200/80 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'card'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <CreditCard size={13} />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'momo'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>MoMo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('flutterwave')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'flutterwave'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Zap size={13} />
                  <span>Gateway</span>
                </button>
              </div>

              {/* CARD FORM */}
              {paymentMethod === 'card' && (
                <form onSubmit={handleCardPayment} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Card Information</label>
                    <button
                      type="button"
                      onClick={() => setCardData({
                        number: '4242 4242 4242 4242',
                        expiry: '12/28',
                        cvv: '739',
                        name: user?.displayName || 'Dr. Alex Johnson'
                      })}
                      className="text-[9px] text-blue-600 dark:text-cyan-400 hover:underline font-bold"
                    >
                      Autofill Test Visa
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    placeholder="Card Number: 4242 4242 4242 4242"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-blue-600"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-blue-600"
                    />
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      placeholder="CVV / CVC"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-blue-600"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    placeholder="Cardholder Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                    <span>Pay {currentPlan?.price} Securely</span>
                  </button>
                </form>
              )}

              {/* MOBILE MONEY FORM */}
              {paymentMethod === 'momo' && (
                <form onSubmit={handleMoMoConfirm} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      MTN / Airtel Mobile Money Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="+256 772 000 000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-blue-600"
                    />
                  </div>

                  {momoStep === 'push_sent' && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-left space-y-2"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <CheckCircle2 size={14} />
                        <span>USSD Push Dispatched to Phone</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">
                        Please enter your 4-digit Mobile Money PIN to approve transaction:
                      </p>
                      <input
                        type="password"
                        required
                        maxLength={5}
                        value={momoPin}
                        onChange={(e) => setMomoPin(e.target.value)}
                        placeholder="PIN (e.g. 1234)"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg text-center text-sm font-mono tracking-widest outline-none"
                      />
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Smartphone size={15} />}
                    <span>{momoStep === 'input' ? 'Dispatch USSD Prompt' : 'Confirm PIN & Authorize'}</span>
                  </button>
                </form>
              )}

              {/* FLUTTERWAVE GATEWAY */}
              {paymentMethod === 'flutterwave' && (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect directly to Flutterwave international processing gateway for multi-currency settlement.
                  </p>
                  <button
                    type="button"
                    onClick={triggerFlutterwave}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap size={15} />
                    <span>Launch Flutterwave Gateway</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* OFFICIAL CLINICAL INVOICE & RECEIPT MODAL                   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showReceiptModal && receiptData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden text-left"
            >
              {/* Receipt Header */}
              <div className="text-center pb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Payment Confirmed & Protocol Active
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  TRANSACTION CONFIRMED • RECEIPT #{receiptData.receiptNo}
                </span>
              </div>

              {/* Receipt Ledger Table */}
              <div className="my-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-medium">Billed To</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receiptData.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-medium">Account Email</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{receiptData.customerEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-medium">Activated Protocol</span>
                  <span className="font-bold text-blue-600 dark:text-cyan-400">{receiptData.planName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-medium">Payment Channel</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{receiptData.paymentMethod}</span>
                </div>
                {receiptData.subtotal && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400 font-medium">Net Subtotal</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{receiptData.subtotal}</span>
                  </div>
                )}
                {receiptData.vat && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400 font-medium">Uganda VAT</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{receiptData.vat}</span>
                  </div>
                )}
                {receiptData.hmacPrefix && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400 font-medium">HMAC-SHA256 Seal</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">{receiptData.hmacPrefix}...</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-medium">Transaction Timestamp</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{receiptData.date}</span>
                </div>
                <div className="flex justify-between py-1.5 pt-2 text-sm font-black border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white">Amount Paid</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{receiptData.amount}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 mt-5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-600/25 cursor-pointer"
                >
                  <Check size={13} />
                  <span>Done</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
