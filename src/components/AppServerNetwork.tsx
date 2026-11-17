import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Stethoscope,
  MessageSquare,
  Send,
  ShieldCheck,
  Activity,
  Search,
  Check,
  RefreshCw,
  PhoneCall,
  UserPlus,
  UserCheck,
  UserX,
  Lock,
  ShieldAlert,
  Ban,
  Coins,
  TrendingUp,
  Radio,
  FileHeart,
  Sparkles,
  CheckCircle2,
  X,
  Megaphone
} from 'lucide-react';
import { api, User, NetworkMessage } from '../api';
import { reconnectNeuralMeshClient } from '../utils/neuralClient';

interface AppServerNetworkProps {
  currentUser: User | null;
  onUpdateUser?: (user: User) => void;
  onNavigate?: (view: string, opts?: { billingTab?: 'protocols' | 'storage' | 'sms' | 'ledger' }) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type HubTab = 'chat' | 'requests' | 'broadcast' | 'memory';

export const AppServerNetwork: React.FC<AppServerNetworkProps> = ({
  currentUser,
  onUpdateUser,
  onNavigate,
  onShowToast
}) => {
  const [hubTab, setHubTab] = useState<HubTab>('chat');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalAccounts: 0,
    connectedCount: 0,
    pendingIncoming: 0,
    blockedCount: 0
  });
  const [moderationIncidents, setModerationIncidents] = useState<any[]>([]);
  const [smsStats, setSmsStats] = useState<{
    mySmsCredits: number;
    totalSent: number;
    totalSegments: number;
    totalRevenueUgx: number;
    totalWholesaleCostUgx: number;
    totalProfitUgx: number;
    unitPriceUgx: number;
    unitCostUgx: number;
    unitMarginUgx: number;
    recentDispatches: any[];
  }>({
    mySmsCredits: currentUser?.smsCredits ?? 25,
    totalSent: 0,
    totalSegments: 0,
    totalRevenueUgx: 0,
    totalWholesaleCostUgx: 0,
    totalProfitUgx: 0,
    unitPriceUgx: 150,
    unitCostUgx: 60,
    unitMarginUgx: 90,
    recentDispatches: []
  });

  const [selectedPeerId, setSelectedPeerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'doctor' | 'patient' | 'admin'>('all');

  // Conversation + SMS state
  const [messages, setMessages] = useState<NetworkMessage[]>([]);
  const [threadBlockedInfo, setThreadBlockedInfo] = useState<{
    blocked: boolean;
    status?: string;
    reason?: string | null;
  }>({ blocked: false });
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState<'mesh_only' | 'mesh_and_sms' | 'sms_only'>('mesh_only');
  const [isSending, setIsSending] = useState(false);

  // Friend Request Note Modal / Inline Note
  const [requestNoteMap, setRequestNoteMap] = useState<Record<string, string>>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Server Multi-User Broadcast State
  const [selectedBroadcastIds, setSelectedBroadcastIds] = useState<string[]>([]);
  const [broadcastSubject, setBroadcastSubject] = useState('Doctorian Clinical Advisory');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    sentCount: number;
    skipped: Array<{ userId: string; reason: string }>;
  } | null>(null);

  // Patient Memory & Restricted Dossier Preview State
  const [myMemory, setMyMemory] = useState<any>(null);
  const [memoryForm, setMemoryForm] = useState({
    age: '',
    gender: 'Unspecified',
    district: '',
    phone: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: ''
  });
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [dossierModal, setDossierModal] = useState<{
    open: boolean;
    loading: boolean;
    restrictedError?: string;
    data?: any;
  }>({ open: false, loading: false });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isGuestOrLoggedOut = !currentUser || currentUser.role === 'guest';

  const loadDirectoryAndAnalytics = useCallback(async () => {
    if (isGuestOrLoggedOut) return;
    try {
      const [dirRes, analyticsRes] = await Promise.all([
        api.connections.getDirectory(),
        api.sms.getAnalytics()
      ]);

      const nextAccounts = dirRes.accounts || [];
      setAccounts(nextAccounts);
      if (dirRes.summary) setSummary(dirRes.summary);
      setModerationIncidents(dirRes.moderationIncidents || []);

      if (analyticsRes) {
        setSmsStats(analyticsRes);
        if (currentUser && onUpdateUser && typeof analyticsRes.mySmsCredits === 'number' && analyticsRes.mySmsCredits !== currentUser.smsCredits) {
          onUpdateUser({ ...currentUser, smsCredits: analyticsRes.mySmsCredits });
        }
      }

      if (nextAccounts.length > 0 && !selectedPeerId) {
        const firstAccepted = nextAccounts.find((a) => a.connectionStatus === 'accepted');
        setSelectedPeerId((firstAccepted || nextAccounts[0]).id);
      }
    } catch (err: any) {
      onShowToast?.(err?.message || 'Unable to load registered accounts', 'error');
    }
  }, [isGuestOrLoggedOut, selectedPeerId]);

  const loadMyPatientMemory = useCallback(async () => {
    if (isGuestOrLoggedOut) return;
    try {
      const res = await api.patientMemory.getMe();
      setMyMemory(res.patientMemory || null);
      if (res.patientMemory?.patient) {
        const p = res.patientMemory.patient;
        setMemoryForm({
          age: p.age ? String(p.age) : '',
          gender: p.gender || 'Unspecified',
          district: p.district || '',
          phone: p.phone || '',
          bloodGroup: p.blood_group || '',
          allergies: p.allergies || '',
          chronicConditions: p.chronic_conditions || ''
        });
      }
    } catch {
      // Non-patient or unprovisioned
    }
  }, [isGuestOrLoggedOut]);

  const loadMessages = useCallback(async () => {
    if (isGuestOrLoggedOut || !selectedPeerId) return;
    try {
      const res = await api.network.getMessages({ peerId: selectedPeerId });
      setMessages(res.messages || []);
      setThreadBlockedInfo({
        blocked: Boolean(res.blocked),
        status: res.connectionStatus,
        reason: res.blockReason
      });
    } catch {
      setMessages([]);
    }
  }, [isGuestOrLoggedOut, selectedPeerId]);

  useEffect(() => {
    void loadDirectoryAndAnalytics();
    void loadMyPatientMemory();
  }, [loadDirectoryAndAnalytics, loadMyPatientMemory]);

  useEffect(() => {
    if (!selectedPeerId || isGuestOrLoggedOut) return;
    void loadMessages();
    const interval = setInterval(() => {
      void loadMessages();
      void loadDirectoryAndAnalytics();
    }, 6000);

    const onSignal = () => {
      void loadMessages();
      void loadDirectoryAndAnalytics();
    };
    window.addEventListener('doctorian-neural-signal', onSignal);
    window.addEventListener('doctorian-neural-hydrated', onSignal);
    reconnectNeuralMeshClient();

    return () => {
      clearInterval(interval);
      window.removeEventListener('doctorian-neural-signal', onSignal);
      window.removeEventListener('doctorian-neural-hydrated', onSignal);
    };
  }, [selectedPeerId, isGuestOrLoggedOut, loadMessages, loadDirectoryAndAnalytics]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const selectedPeer = accounts.find((a) => a.id === selectedPeerId) || null;
  const connectedAccounts = accounts.filter((a) => a.connectionStatus === 'accepted');

  const handleSendFriendRequest = async (targetUserId: string) => {
    setActionLoadingId(targetUserId);
    try {
      const note = requestNoteMap[targetUserId] || '';
      await api.connections.sendRequest(targetUserId, note, true);
      onShowToast?.('Friend request sent to registered account.', 'success');
      await loadDirectoryAndAnalytics();
    } catch (err: any) {
      onShowToast?.(err.message || 'Could not send friend request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    setActionLoadingId(connectionId);
    try {
      await api.connections.accept(connectionId, true);
      onShowToast?.('Friend request accepted — secure messaging & SMS unlocked.', 'success');
      await loadDirectoryAndAnalytics();
      await loadMessages();
    } catch (err: any) {
      onShowToast?.(err.message || 'Could not accept friend request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineRequest = async (connectionId: string) => {
    setActionLoadingId(connectionId);
    try {
      await api.connections.decline(connectionId);
      onShowToast?.('Connection request declined.', 'info');
      await loadDirectoryAndAnalytics();
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to decline request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleManualBlock = async (targetUserId: string) => {
    setActionLoadingId(targetUserId);
    try {
      await api.connections.block(targetUserId, 'Blocked for abusive or unwelcome communication');
      onShowToast?.('Conversation blocked between both accounts.', 'info');
      await loadDirectoryAndAnalytics();
      await loadMessages();
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to block conversation', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendChatOrSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPeer) return;
    setIsSending(true);
    const cleanText = messageText.trim();

    try {
      if (deliveryChannel !== 'sms_only') {
        await api.network.sendMessage({
          recipientId: selectedPeer.id,
          recipientName: selectedPeer.displayName,
          channel: 'direct',
          content: cleanText,
          subject: messageSubject.trim() || undefined,
          messageType: 'text',
          priority: 'normal'
        });
      }

      if (deliveryChannel === 'mesh_and_sms' || deliveryChannel === 'sms_only') {
        const smsRes = await api.telephony.sendSms({
          recipientId: selectedPeer.id,
          recipientName: selectedPeer.displayName,
          recipientRole: selectedPeer.role,
          recipientPhone: selectedPeer.phone,
          message: cleanText
        });
        if (typeof smsRes.sms?.remainingSmsCredits === 'number' && currentUser && onUpdateUser) {
          onUpdateUser({ ...currentUser, smsCredits: smsRes.sms.remainingSmsCredits });
        }
        onShowToast?.(
          `SMS delivered (${smsRes.sms.segments || 1} seg · ${(smsRes.sms.priceUgx || 150).toLocaleString()} UGX billed)`,
          'success'
        );
      } else {
        onShowToast?.('Encrypted message delivered.', 'success');
      }

      setMessageText('');
      setMessageSubject('');
      await Promise.all([loadMessages(), loadDirectoryAndAnalytics()]);
    } catch (err: any) {
      if (err?.blockedForAbuse) {
        onShowToast?.(err.message || 'Conversation locked for abusive content!', 'error');
        await Promise.all([loadDirectoryAndAnalytics(), loadMessages()]);
      } else if (err?.requiresSmsTopUp) {
        onShowToast?.(err.message || 'Out of SMS credits. Top up an SMS Bundle in Billing.', 'error');
      } else {
        onShowToast?.(err.message || 'Delivery blocked', 'error');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleServerMultiUserBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim() || selectedBroadcastIds.length === 0) {
      onShowToast?.('Select connected users and enter an advisory message.', 'error');
      return;
    }
    setIsBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await api.sms.serverDispatch({
        recipientUserIds: selectedBroadcastIds,
        subject: broadcastSubject.trim() || 'Doctorian Clinical Advisory',
        message: broadcastMessage.trim()
      });
      setBroadcastResult({ sentCount: res.sentCount, skipped: res.skipped || [] });
      if (typeof res.remainingSmsCredits === 'number' && currentUser && onUpdateUser) {
        onUpdateUser({ ...currentUser, smsCredits: res.remainingSmsCredits });
      }
      onShowToast?.(`Server dispatched SMS + live alerts to ${res.sentCount} registered user(s).`, 'success');
      setBroadcastMessage('');
      await loadDirectoryAndAnalytics();
    } catch (err: any) {
      onShowToast?.(err.message || 'Multi-user dispatch failed', 'error');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleInspectPatientDossier = async (patientId: string) => {
    setDossierModal({ open: true, loading: true });
    try {
      const res = await api.patientMemory.getPatientDossier(patientId);
      setDossierModal({ open: true, loading: false, data: res.dossier });
    } catch (err: any) {
      setDossierModal({
        open: true,
        loading: false,
        restrictedError: err?.message || 'Restricted Patient Record: Friend request acceptance required.'
      });
    }
  };

  const handleSaveMyMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMemory(true);
    try {
      const res = await api.patientMemory.updateMe({
        age: memoryForm.age ? Number(memoryForm.age) : undefined,
        gender: memoryForm.gender,
        district: memoryForm.district,
        phone: memoryForm.phone,
        bloodGroup: memoryForm.bloodGroup,
        allergies: memoryForm.allergies,
        chronicConditions: memoryForm.chronicConditions
      });
      setMyMemory(res.patientMemory);
      onShowToast?.('Your clinical profile is securely remembered on the server.', 'success');
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to save clinical memory', 'error');
    } finally {
      setIsSavingMemory(false);
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'doctor' ? a.role === 'doctor' || a.role === 'nurse' : a.role === roleFilter);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.displayName?.toLowerCase().includes(q) ||
      a.specialty?.toLowerCase().includes(q) ||
      a.facility?.toLowerCase().includes(q) ||
      a.role?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const estSegments = Math.max(1, Math.ceil((messageText.trim().length || 1) / 160));
  const estBroadcastSegments = Math.max(1, Math.ceil((`${broadcastSubject} ${broadcastMessage}`.trim().length || 1) / 160));

  if (isGuestOrLoggedOut) {
    return (
      <div className="max-w-3xl mx-auto my-8 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
          <Lock size={26} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Registered Account Required</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          To protect patient records, friend connections, and commercial SMS dispatching, unregistered visitors and guest accounts cannot access user directories or private patient memory.
        </p>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('auth')}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            Sign In With Registered Account
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-5 font-sans">
      {/* 1. PROFITABLE SMS & PRIVACY CONTROL HEADER */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
              <Radio size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                SMS Hub &amp; Connected Care Mesh
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Friend-request gated conversations · Abuse auto-blocking · Commercial SMS billing · Remembered patient privacy
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('billing', { billingTab: 'sms' });
              }}
              className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Coins size={14} />
              <span>Top Up SMS ({smsStats.mySmsCredits})</span>
            </button>
            <button
              type="button"
              onClick={() => void loadDirectoryAndAnalytics()}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              title="Refresh Directory & Metrics"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Live Economics & Connection Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>My SMS Balance</span>
              <MessageSquare size={14} className="text-sky-400" />
            </div>
            <p className="text-xl font-black text-white mt-1 tabular-nums">
              {smsStats.mySmsCredits.toLocaleString()} <span className="text-xs font-semibold text-sky-400">credits</span>
            </p>
            <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">{smsStats.unitPriceUgx} UGX/seg billed</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Net SMS Margin</span>
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <p className="text-xl font-black text-emerald-400 mt-1 tabular-nums">
              +{smsStats.totalProfitUgx.toLocaleString()} <span className="text-xs">UGX</span>
            </p>
            <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">
              {smsStats.totalRevenueUgx.toLocaleString()} billed / {smsStats.totalSegments} segs
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Accepted Friends</span>
              <UserCheck size={14} className="text-cyan-400" />
            </div>
            <p className="text-xl font-black text-white mt-1 tabular-nums">
              {summary.connectedCount} <span className="text-xs text-slate-400">/ {summary.totalAccounts}</span>
            </p>
            <p className="text-[11px] text-amber-300 tabular-nums mt-0.5">
              {summary.pendingIncoming} pending incoming
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Abuse Auto-Blocks</span>
              <ShieldAlert size={14} className="text-rose-400" />
            </div>
            <p className="text-xl font-black text-rose-400 mt-1 tabular-nums">{summary.blockedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time toxicity shield</p>
          </div>
        </div>

        {/* Clean Hub Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { id: 'chat', label: 'Connected Chat & SMS', icon: MessageSquare },
            {
              id: 'requests',
              label: `Friend Requests (${summary.pendingIncoming})`,
              icon: UserPlus
            },
            { id: 'broadcast', label: 'Server Multi-User SMS', icon: Megaphone },
            { id: 'memory', label: 'Patient Memory & Safety', icon: FileHeart }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = hubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHubTab(tab.id as HubTab)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CONNECTED CHAT & DIRECT SMS */}
      {hubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Account List */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered accounts..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(['all', 'doctor', 'patient', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize cursor-pointer whitespace-nowrap ${
                    roleFilter === r
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-0.5">
              {filteredAccounts.map((acc) => {
                const isSelected = selectedPeerId === acc.id;
                const status = acc.connectionStatus;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedPeerId(acc.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {acc.displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {acc.role} · {acc.specialty || acc.facility || 'Doctorian Network'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg shrink-0 ${
                        status === 'accepted'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : status === 'pending'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                          : status === 'blocked_abuse' || status === 'blocked_manual'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {status === 'accepted'
                        ? 'Friend'
                        : status === 'pending'
                        ? acc.initiatedByMe
                          ? 'Sent'
                          : 'Accept?'
                        : status.startsWith('blocked')
                        ? 'Blocked'
                        : 'Locked'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Thread Workspace */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col min-h-[540px]">
            {selectedPeer ? (
              <>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedPeer.displayName}</span>
                      <span className="text-[11px] font-bold uppercase text-cyan-600 dark:text-cyan-400">
                        · {selectedPeer.role}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedPeer.connectionStatus === 'accepted'
                        ? `Connected · ${selectedPeer.phone || 'Verified Peer'} · ${selectedPeer.facility || 'Care Node'}`
                        : 'Private contact details hidden until friend request is accepted'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedPeer.patientId && (
                      <button
                        type="button"
                        onClick={() => void handleInspectPatientDossier(selectedPeer.patientId)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileHeart size={13} />
                        <span>Patient Memory</span>
                      </button>
                    )}

                    {selectedPeer.connectionStatus === 'accepted' && (
                      <button
                        type="button"
                        disabled={actionLoadingId === selectedPeer.id}
                        onClick={() => void handleManualBlock(selectedPeer.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ban size={13} />
                        <span>Report / Block</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Thread Feed */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-h-[340px] space-y-3 bg-slate-50/40 dark:bg-slate-950/30">
                  {threadBlockedInfo.blocked || selectedPeer.connectionStatus.startsWith('blocked') ? (
                    <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-2 my-6">
                      <ShieldAlert className="w-9 h-9 text-rose-500 mx-auto" />
                      <h4 className="text-sm font-black text-rose-700 dark:text-rose-300">
                        Conversation Locked Between Accounts
                      </h4>
                      <p className="text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto">
                        {selectedPeer.blockReason || threadBlockedInfo.reason || 'Blocked due to abusive content or safety policy.'}
                      </p>
                      {selectedPeer.canUnblock && selectedPeer.connectionId && (
                        <button
                          type="button"
                          onClick={async () => {
                            await api.connections.unblock(selectedPeer.connectionId);
                            onShowToast?.('Connection restored.', 'success');
                            await loadDirectoryAndAnalytics();
                            await loadMessages();
                          }}
                          className="mt-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
                        >
                          Restore Connection
                        </button>
                      )}
                    </div>
                  ) : selectedPeer.connectionStatus !== 'accepted' ? (
                    <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-center space-y-3 my-6">
                      <Lock className="w-9 h-9 text-amber-500 mx-auto" />
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {selectedPeer.connectionStatus === 'pending'
                          ? selectedPeer.initiatedByMe
                            ? 'Friend Request Sent — Awaiting Acceptance'
                            : 'Incoming Friend Request From This Account'
                          : 'Friend Request Required Before Messaging'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        {selectedPeer.connectionStatus === 'pending' && !selectedPeer.initiatedByMe
                          ? `${selectedPeer.displayName} sent you a connection request${selectedPeer.requestNote ? `: "${selectedPeer.requestNote}"` : '.'}`
                          : 'Interested accounts must send and accept a friend request first to unlock direct chat, SMS, and shared care records.'}
                      </p>

                      {selectedPeer.connectionStatus === 'pending' && !selectedPeer.initiatedByMe ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleAcceptRequest(selectedPeer.connectionId)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer flex items-center gap-1.5"
                          >
                            <Check size={14} />
                            <span>Accept Friend Request</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeclineRequest(selectedPeer.connectionId)}
                            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      ) : selectedPeer.connectionStatus === 'none' || selectedPeer.connectionStatus === 'declined' ? (
                        <div className="max-w-sm mx-auto space-y-2">
                          <input
                            type="text"
                            value={requestNoteMap[selectedPeer.id] || ''}
                            onChange={(e) =>
                              setRequestNoteMap((prev) => ({ ...prev, [selectedPeer.id]: e.target.value }))
                            }
                            placeholder="Optional intro note (e.g. Consultation follow-up)..."
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            disabled={actionLoadingId === selectedPeer.id}
                            onClick={() => void handleSendFriendRequest(selectedPeer.id)}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <UserPlus size={14} />
                            <span>Send Friend Request</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">
                      Connected with {selectedPeer.displayName}. Start an encrypted conversation or send a GSM SMS below.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMine = currentUser && m.senderId === currentUser.id;
                      return (
                        <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
                            {m.senderName} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div
                            className={`max-w-md px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                              isMine
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none'
                            }`}
                          >
                            {m.subject && <p className="font-black text-[11px] uppercase mb-1 opacity-85">{m.subject}</p>}
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Composer (Enabled only if accepted and unblocked) */}
                {selectedPeer.connectionStatus === 'accepted' && !threadBlockedInfo.blocked && (
                  <form onSubmit={handleSendChatOrSms} className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {[
                          { id: 'mesh_only', label: 'Mesh Chat (Free)' },
                          { id: 'mesh_and_sms', label: `Chat + SMS (${estSegments * 150} UGX)` },
                          { id: 'sms_only', label: `GSM SMS (${estSegments} seg)` }
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setDeliveryChannel(mode.id as any)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer ${
                              deliveryChannel === mode.id
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Abuse Shield Active
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={`Message ${selectedPeer.displayName}...`}
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={isSending || !messageText.trim()}
                        className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Send size={14} />
                        <span>{isSending ? 'Sending...' : deliveryChannel === 'mesh_only' ? 'Send' : 'Dispatch'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">
                Select a registered account to connect or view messages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DISCOVER & FRIEND REQUESTS */}
      {hubTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{acc.displayName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {acc.role} · {acc.specialty || acc.facility || 'Registered Member'}
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {acc.connectionStatus.replace('_', ' ')}
                  </span>
                </div>

                {acc.requestNote && (
                  <p className="mt-2.5 text-xs italic text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl">
                    "{acc.requestNote}"
                  </p>
                )}
                {acc.blockReason && (
                  <p className="mt-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl">
                    {acc.blockReason}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {acc.connectionStatus === 'pending' && !acc.initiatedByMe ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleAcceptRequest(acc.connectionId)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
                    >
                      Accept Request
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeclineRequest(acc.connectionId)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                ) : acc.connectionStatus === 'accepted' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPeerId(acc.id);
                      setHubTab('chat');
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black cursor-pointer"
                  >
                    Open Connected Thread
                  </button>
                ) : acc.connectionStatus === 'pending' ? (
                  <div className="w-full py-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold text-center">
                    Pending Peer Acceptance
                  </div>
                ) : !acc.connectionStatus.startsWith('blocked') ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={requestNoteMap[acc.id] || ''}
                      onChange={(e) => setRequestNoteMap((p) => ({ ...p, [acc.id]: e.target.value }))}
                      placeholder="Short intro..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      disabled={actionLoadingId === acc.id}
                      onClick={() => void handleSendFriendRequest(acc.id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SERVER MULTI-USER INFORMATION DISPATCH (PROFITABLE SMS + LIVE PUSH) */}
      {hubTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form
            onSubmit={handleServerMultiUserBroadcast}
            className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4"
          >
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Multi-User Server Information &amp; SMS Dispatch
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Server dispatches clinical advisories via GSM SMS + real-time WebSocket mesh simultaneously across your accepted connections.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Connected Accounts ({selectedBroadcastIds.length} selected)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedBroadcastIds(
                      selectedBroadcastIds.length === connectedAccounts.length
                        ? []
                        : connectedAccounts.map((a) => a.id)
                    )
                  }
                  className="text-xs font-bold text-blue-600 dark:text-cyan-400 cursor-pointer"
                >
                  {selectedBroadcastIds.length === connectedAccounts.length ? 'Clear All' : 'Select All Connected'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
                {connectedAccounts.length === 0 ? (
                  <p className="text-xs text-slate-400 col-span-2 py-4 text-center">
                    Accept at least one friend request first to dispatch multi-user messages.
                  </p>
                ) : (
                  connectedAccounts.map((acc) => {
                    const checked = selectedBroadcastIds.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() =>
                          setSelectedBroadcastIds((prev) =>
                            checked ? prev.filter((id) => id !== acc.id) : [...prev, acc.id]
                          )
                        }
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer ${
                          checked
                            ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{acc.displayName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {acc.role} · {acc.phone || 'Verified Peer'}
                          </p>
                        </div>
                        {checked && <CheckCircle2 size={16} className="text-sky-600 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <input
              type="text"
              value={broadcastSubject}
              onChange={(e) => setBroadcastSubject(e.target.value)}
              placeholder="Advisory Subject..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />

            <textarea
              rows={4}
              required
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter important clinical update, lab notification, or schedule dispatch..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                Est. Cost: <span className="font-black text-slate-900 dark:text-white">{(selectedBroadcastIds.length * estBroadcastSegments * 150).toLocaleString()} UGX</span> ({selectedBroadcastIds.length * estBroadcastSegments} credits · +{(selectedBroadcastIds.length * estBroadcastSegments * 90).toLocaleString()} UGX net profit)
              </div>
              <button
                type="submit"
                disabled={isBroadcasting || selectedBroadcastIds.length === 0 || !broadcastMessage.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {isBroadcasting ? 'Dispatching...' : 'Send Server SMS + Live Push'}
              </button>
            </div>

            {broadcastResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                Dispatched to <strong>{broadcastResult.sentCount}</strong> account(s).
                {broadcastResult.skipped.length > 0 && ` Skipped ${broadcastResult.skipped.length} unaccepted/blocked account(s).`}
              </div>
            )}
          </form>

          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Recent Commercial SMS Ledger</h4>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {smsStats.recentDispatches.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No SMS dispatches billed yet.</p>
              ) : (
                smsStats.recentDispatches.map((row) => (
                  <div key={row.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>{row.recipient_name}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{Number(row.margin_ugx || 90).toLocaleString()} UGX
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{row.message_body}</p>
                    <p className="text-[10px] font-mono text-slate-400">
                      {row.recipient_phone} · {row.segments || 1} seg · {Number(row.price_ugx || 150).toLocaleString()} UGX
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REMEMBERED PATIENT PROFILE & ABUSE MODERATION LOGS */}
      {hubTab === 'memory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Remembered Patient Medical Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Persisted per account on the server. Hidden from unregistered users and unconnected accounts.
                </p>
              </div>
              {myMemory?.patient?.mrn && (
                <span className="px-3 py-1 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono text-xs font-bold">
                  {myMemory.patient.mrn}
                </span>
              )}
            </div>

            {myMemory?.patient ? (
              <form onSubmit={handleSaveMyMemory} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">District / Location</label>
                    <input
                      type="text"
                      value={memoryForm.district}
                      onChange={(e) => setMemoryForm((f) => ({ ...f, district: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Blood Group</label>
                    <input
                      type="text"
                      value={memoryForm.bloodGroup}
                      onChange={(e) => setMemoryForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Documented Allergies</label>
                  <input
                    type="text"
                    value={memoryForm.allergies}
                    onChange={(e) => setMemoryForm((f) => ({ ...f, allergies: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Chronic Conditions / Care Notes</label>
                  <input
                    type="text"
                    value={memoryForm.chronicConditions}
                    onChange={(e) => setMemoryForm((f) => ({ ...f, chronicConditions: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-500">
                    Remembered: {myMemory.vitals?.length || 0} vitals · {myMemory.prescriptions?.length || 0} Rx · {myMemory.labs?.length || 0} labs
                  </p>
                  <button
                    type="submit"
                    disabled={isSavingMemory}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black cursor-pointer"
                  >
                    {isSavingMemory ? 'Saving...' : 'Remember Details'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-500 py-6">
                Clinician/Admin account active. You can inspect remembered dossiers only for patients assigned to you or with an accepted friend connection.
              </p>
            )}
          </div>

          <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Abuse Auto-Block Audit Incidents</h3>
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {moderationIncidents.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No abusive conversation locks recorded.</p>
              ) : (
                moderationIncidents.map((inc) => (
                  <div key={inc.id} className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/70 space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-rose-700 dark:text-rose-300">
                      <span>{inc.matched_category} ({inc.severity})</span>
                      <span className="font-mono text-[10px]">{new Date(inc.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400">Pair: {inc.pair_key} · Channel: {inc.channel}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Restricted Patient Memory Modal */}
      <AnimatePresence>
        {dossierModal.open && (
          <div className="fixed inset-0 z-[150] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Remembered Patient Clinical Record</h3>
                <button
                  type="button"
                  onClick={() => setDossierModal({ open: false, loading: false })}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {dossierModal.loading ? (
                <p className="text-xs text-slate-500 py-6 text-center">Verifying access permissions...</p>
              ) : dossierModal.restrictedError ? (
                <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs">
                    <Lock size={16} />
                    <span>Strict Privacy Restriction Active</span>
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300">{dossierModal.restrictedError}</p>
                </div>
              ) : dossierModal.data?.patient ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {dossierModal.data.patient.full_name} ({dossierModal.data.patient.mrn})
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {dossierModal.data.patient.age}y · {dossierModal.data.patient.gender} · {dossierModal.data.patient.district} · Blood {dossierModal.data.patient.blood_group}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Allergies: <strong>{dossierModal.data.patient.allergies}</strong>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Conditions: <strong>{dossierModal.data.patient.chronic_conditions}</strong>
                    </p>
                  </div>
                  <p className="text-slate-500 font-semibold">
                    Records Remembered: {dossierModal.data.vitals?.length || 0} Vitals · {dossierModal.data.prescriptions?.length || 0} Prescriptions · {dossierModal.data.labs?.length || 0} Lab Results
                  </p>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
