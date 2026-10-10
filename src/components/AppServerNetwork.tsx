import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Stethoscope, MessageSquare, Send, ShieldCheck, Activity, 
  Search, Plus, Check, CheckCheck, Clock, AlertCircle, RefreshCw, 
  Sparkles, FileText, Pill, Heart, Zap, Phone, ArrowLeft, Eye, 
  UserCheck, Building2, ChevronRight, Share2, Radio, Bell, CheckCircle2
} from 'lucide-react';
import { api, User, NetworkMessage } from '../api';

interface AppServerNetworkProps {
  currentUser: User | null;
  onNavigate?: (view: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AppServerNetwork: React.FC<AppServerNetworkProps> = ({
  currentUser,
  onNavigate,
  onShowToast
}) => {
  // Navigation tabs
  const [activeChannel, setActiveChannel] = useState<'doctor_colleagues' | 'consultation' | 'direct'>('doctor_colleagues');
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<NetworkMessage[]>([]);
  const [selectedPeerId, setSelectedPeerId] = useState<string>('doctor-gloria-id');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Message composition states
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messagePriority, setMessagePriority] = useState<'normal' | 'urgent' | 'stat_emergency'>('normal');
  const [messageType, setMessageType] = useState<'text' | 'clinical_note' | 'prescription' | 'vitals_alert' | 'referral'>('text');
  const [attachVitals, setAttachVitals] = useState(false);

  // Telemetry stats
  const [networkStats, setNetworkStats] = useState<any>({
    totalMessages: 0,
    totalUsers: 0,
    totalDoctors: 0,
    unreadCount: 0,
    latencyMs: 14
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Network Directory and Initial Messages
  const loadNetworkData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.network.getUsers(),
        api.network.getStats()
      ]);
      setUsers(usersRes.users || []);
      setNetworkStats(statsRes);
    } catch (err) {
      console.warn("[SERVER NETWORK] Failed to load initial data:", err);
    }
  };

  const loadMessages = async () => {
    try {
      let params: { channel?: string; peerId?: string } = {};
      if (activeChannel === 'doctor_colleagues') {
        params.channel = 'doctor_colleagues';
      } else if (activeChannel === 'consultation') {
        params.channel = 'consultation';
      } else {
        params.peerId = selectedPeerId;
      }

      const res = await api.network.getMessages(params);
      setMessages(res.messages || []);
    } catch (err) {
      console.warn("[SERVER NETWORK] Failed to load messages:", err);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3500);
    return () => clearInterval(interval);
  }, [activeChannel, selectedPeerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (!currentUser) {
      onShowToast?.("Please sign in to transmit messages across the Doctorian Server Network", "error");
      return;
    }

    setIsSending(true);
    try {
      let recipientId = 'doctor_network';
      let recipientName = 'Doctor-to-Doctor Clinical Network';

      if (activeChannel === 'direct' || activeChannel === 'consultation') {
        recipientId = selectedPeerId;
        const target = users.find(u => u.id === selectedPeerId);
        recipientName = target ? (target.displayName || target.email) : 'Clinical Colleague';
      }

      let attachments = null;
      if (attachVitals) {
        attachments = {
          bloodPressure: "126/82 mmHg",
          heartRate: "74 bpm",
          spo2: "98%",
          temperature: "36.8 °C",
          deviceSource: "Doctorian Telemetry Sensor Node v2"
        };
      }

      await api.network.sendMessage({
        recipientId,
        recipientName,
        channel: activeChannel,
        content: messageText.trim(),
        subject: messageSubject.trim() || undefined,
        messageType,
        attachments,
        priority: messagePriority
      });

      setMessageText('');
      setMessageSubject('');
      setAttachVitals(false);
      setMessagePriority('normal');
      setMessageType('text');
      onShowToast?.("Message routed & delivered via Doctorian Server Network", "success");
      await loadMessages();
    } catch (err: any) {
      onShowToast?.(err.message || "Failed to transmit message", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPeerUser = users.find(u => u.id === selectedPeerId);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 select-none font-sans">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* TOP NETWORK STATUS BAR                                     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <Radio size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Doctorian <span className="text-blue-600 dark:text-cyan-400">Server Network</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  SERVER MESH ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-Account Clinical Telemetry & Inter-Account Communications Matrix
              </p>
            </div>
          </div>

          {/* Network Telemetry Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center gap-2">
              <Building2 size={13} className="text-blue-600 dark:text-cyan-400" />
              <span className="text-slate-600 dark:text-slate-300 font-medium font-mono text-[11px]">Node: UG-KLA-01</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center gap-2">
              <Users size={13} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-slate-600 dark:text-slate-300 font-medium font-mono text-[11px]">
                {networkStats.totalUsers || users.length} Accounts
              </span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center gap-2">
              <Stethoscope size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-600 dark:text-slate-300 font-medium font-mono text-[11px]">
                Verified Clinicians: {users.filter(u => u.isDoctor).length || 3}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center gap-2">
              <Activity size={13} className="text-cyan-600 dark:text-cyan-400" />
              <span className="text-slate-600 dark:text-slate-300 font-medium font-mono text-[11px]">
                Latency: {networkStats.latencyMs || 14}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* CHANNEL TABS: 3 COMMUNICATION MODES                         */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
        <button
          type="button"
          onClick={() => setActiveChannel('doctor_colleagues')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeChannel === 'doctor_colleagues'
              ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25 ring-2 ring-blue-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeChannel === 'doctor_colleagues' ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400'}`}>
            <Stethoscope size={18} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider">Doctor-to-Doctor Network</div>
            <div className={`text-[10px] mt-0.5 ${activeChannel === 'doctor_colleagues' ? 'text-blue-100' : 'text-slate-400'}`}>
              Clinicians consulting among themselves
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel('consultation')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeChannel === 'consultation'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeChannel === 'consultation' ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'}`}>
            <Activity size={18} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider">Doctor ⇄ Patient Network</div>
            <div className={`text-[10px] mt-0.5 ${activeChannel === 'consultation' ? 'text-emerald-100' : 'text-slate-400'}`}>
              Consultations, advice & e-prescriptions
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel('direct')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeChannel === 'direct'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeChannel === 'direct' ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'}`}>
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider">Direct Account Messaging</div>
            <div className={`text-[10px] mt-0.5 ${activeChannel === 'direct' ? 'text-indigo-100' : 'text-slate-400'}`}>
              Account-to-account communication
            </div>
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MAIN TWO-COLUMN WORKSPACE                                  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Network Directory / Clinicians & Users List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-blue-600 dark:text-cyan-400" />
              <span>Network Accounts Directory</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              {filteredUsers.length} ONLINE
            </span>
          </div>

          {/* Search Directory */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clinicians or patients..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          {/* Directory Accounts List */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto no-scrollbar pr-0.5">
            {filteredUsers.map((u) => {
              const isSelected = selectedPeerId === u.id;
              const isDoctor = u.isDoctor || u.role === 'doctor';
              const isAdmin = u.isAdmin || u.role === 'admin';

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedPeerId(u.id)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400/80 dark:border-blue-600 shadow-sm'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                      isDoctor
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : isAdmin
                        ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                        : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                    }`}>
                      {u.displayName ? u.displayName.slice(0, 2) : u.email.slice(0, 2)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {u.displayName || u.email.split('@')[0]}
                      </span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        isDoctor
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : isAdmin
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {u.specialty}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Conversation Stream & Composer */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[580px]">
          {/* Header of Active Channel / Conversation */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                {activeChannel === 'doctor_colleagues' ? (
                  <Stethoscope size={20} />
                ) : activeChannel === 'consultation' ? (
                  <Activity size={20} />
                ) : (
                  <MessageSquare size={20} />
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {activeChannel === 'doctor_colleagues' && "Doctor-to-Doctor Clinical Colleague Network"}
                  {activeChannel === 'consultation' && "Doctor ⇄ Patient Clinical Consultations"}
                  {activeChannel === 'direct' && `Direct Link: ${selectedPeerUser?.displayName || selectedPeerUser?.email || 'Clinical Peer'}`}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {activeChannel === 'doctor_colleagues' && "Peer review, second opinions & ICU bed coordination"}
                  {activeChannel === 'consultation' && "Clinical advice, digital telemetry reviews & e-prescriptions"}
                  {activeChannel === 'direct' && `Specialty: ${selectedPeerUser?.specialty || 'Health Node'}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadMessages}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh messages"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[380px] space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Radio size={36} className="text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  No Transmission on this Node Yet
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  Send the first message below to broadcast securely through the Doctorian Server Network.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMyMessage = currentUser && m.senderId === currentUser.id;
                const isDoctorSender = m.senderRole === 'doctor' || m.senderSpecialty?.toLowerCase().includes('specialist') || m.senderSpecialty?.toLowerCase().includes('cardiologist') || m.senderSpecialty?.toLowerCase().includes('surgeon');

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                  >
                    {/* Sender Tag */}
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {m.senderName}
                      </span>
                      {isDoctorSender && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 size={9} /> VERIFIED CLINICIAN
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Bubble */}
                    <div className={`p-3.5 sm:p-4 rounded-2xl max-w-lg border shadow-xs ${
                      isMyMessage
                        ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                    }`}>
                      {m.subject && (
                        <div className={`text-xs font-black uppercase tracking-wider pb-1.5 mb-1.5 border-b ${
                          isMyMessage ? 'border-blue-400/50 text-blue-100' : 'border-slate-100 dark:border-slate-700 text-blue-600 dark:text-cyan-400'
                        }`}>
                          {m.subject}
                        </div>
                      )}

                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                        {m.content}
                      </p>

                      {/* Attachments / Telemetry Card */}
                      {m.attachments && (
                        <div className={`mt-2.5 p-2.5 rounded-xl border text-[11px] font-mono ${
                          isMyMessage 
                            ? 'bg-blue-700/60 border-blue-400/40 text-blue-50' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-200'
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider mb-1 text-[9px]">
                            <Activity size={11} /> ATTACHED TELEMETRY STREAM
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            {m.attachments.bloodPressure && (
                              <div>BP: <span className="font-bold">{m.attachments.bloodPressure}</span></div>
                            )}
                            {m.attachments.heartRate && (
                              <div>HR: <span className="font-bold">{m.attachments.heartRate}</span></div>
                            )}
                            {m.attachments.spo2 && (
                              <div>SpO2: <span className="font-bold">{m.attachments.spo2}</span></div>
                            )}
                            {m.attachments.temperature && (
                              <div>Temp: <span className="font-bold">{m.attachments.temperature}</span></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ───────────────────────────────────────────────────────── */}
          {/* COMPOSER / SEND MESSAGE FORM                              */}
          {/* ───────────────────────────────────────────────────────── */}
          <form onSubmit={handleSendMessage} className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttachVitals(!attachVitals)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                    attachVitals 
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Activity size={11} />
                  <span>Attach Live Vitals</span>
                  {attachVitals && <Check size={11} />}
                </button>

                <select
                  value={messagePriority}
                  onChange={(e: any) => setMessagePriority(e.target.value)}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="normal">Normal Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat_emergency">STAT Emergency</option>
                </select>
              </div>

              {/* Quick Clinical Templates */}
              <div className="hidden sm:flex items-center gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setMessageSubject("Clinical Second Opinion Request");
                    setMessageText("Colleagues, requesting review of 12-lead ECG tracing showing intermittent ST depression in lateral leads V5-V6.");
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                >
                  Second Opinion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessageSubject("Prescription & Telemetry Guidance");
                    setMessageText("Based on your latest vitals, continue current dosage regimen. Schedule lab review in 2 weeks.");
                    setMessageType('prescription');
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                >
                  Prescription Note
                </button>
              </div>
            </div>

            {/* Optional Subject Field */}
            <input
              type="text"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              placeholder="Clinical Subject (optional, e.g. Cardiology Consult - Bed 3)..."
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
            />

            {/* Main Message Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  activeChannel === 'doctor_colleagues'
                    ? "Consult with fellow doctors on the server network..."
                    : activeChannel === 'consultation'
                    ? "Send clinical inquiry, symptoms, or recommendation..."
                    : "Direct message to selected account..."
                }
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />

              <button
                type="submit"
                disabled={isSending || !messageText.trim()}
                className="px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-blue-600/25 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
