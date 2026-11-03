import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Stethoscope, MessageSquare, Send, ShieldCheck, Activity, 
  Search, Plus, Check, CheckCheck, Clock, AlertCircle, RefreshCw, 
  Sparkles, FileText, Pill, Heart, Zap, Phone, ArrowLeft, Eye, 
  UserCheck, Building2, ChevronRight, Share2, Radio, Bell, CheckCircle2, ShieldAlert
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
  // Directory tabs: Patients, Doctors, Admin
  const [activeDirectory, setActiveDirectory] = useState<'patients' | 'doctors' | 'admin'>('doctors');
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<NetworkMessage[]>([]);
  const [selectedPeerId, setSelectedPeerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Message composition states
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messagePriority, setMessagePriority] = useState<'normal' | 'urgent' | 'stat_emergency'>('normal');
  const [attachVitals, setAttachVitals] = useState(false);

  // Non-college admin approval workflow state
  const [approvalStatuses, setApprovalStatuses] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({});
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingTargetPeer, setPendingTargetPeer] = useState<any>(null);

  // Current time for Notification Center widget header
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Network Directory and Messages
  const loadNetworkData = async () => {
    try {
      const usersRes = await api.network.getUsers();
      const allUsers = usersRes.users || [];
      setUsers(allUsers);
      if (allUsers.length > 0 && !selectedPeerId) {
        const firstMatch = allUsers.find((u: any) => 
          activeDirectory === 'doctors' ? u.isDoctor :
          activeDirectory === 'admin' ? u.isAdmin : !u.isDoctor && !u.isAdmin
        ) || allUsers[0];
        setSelectedPeerId(firstMatch.id);
      }
    } catch (err) {
      console.warn("[SERVER NETWORK] Failed to load users:", err);
    }
  };

  const loadMessages = async () => {
    try {
      if (!selectedPeerId) return;
      const res = await api.network.getMessages({ peerId: selectedPeerId });
      setMessages(res.messages || []);
    } catch (err) {
      console.warn("[SERVER NETWORK] Failed to load messages:", err);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, [activeDirectory]);

  useEffect(() => {
    if (selectedPeerId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3500);
      return () => clearInterval(interval);
    }
  }, [selectedPeerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Directory Selection
  const handleDirectorySwitch = (dir: 'patients' | 'doctors' | 'admin') => {
    setActiveDirectory(dir);
    const targetList = users.filter(u => 
      dir === 'doctors' ? u.isDoctor :
      dir === 'admin' ? u.isAdmin :
      !u.isDoctor && !u.isAdmin
    );
    if (targetList.length > 0) {
      setSelectedPeerId(targetList[0].id);
    } else {
      setSelectedPeerId('');
    }
  };

  // Check if target is non-college / external
  const isNonCollegePeer = (peer: any) => {
    if (!peer) return false;
    return peer.isExternal || peer.isNonCollege || peer.tags?.includes('external') || peer.institution === 'External Network';
  };

  const handleSelectPeer = (peer: any) => {
    if (isNonCollegePeer(peer)) {
      const status = approvalStatuses[peer.id];
      if (status !== 'approved') {
        setPendingTargetPeer(peer);
        setShowApprovalModal(true);
        return;
      }
    }
    setSelectedPeerId(peer.id);
  };

  const requestAdminApprovalForNonCollege = () => {
    if (!pendingTargetPeer) return;
    setApprovalStatuses(prev => ({ ...prev, [pendingTargetPeer.id]: 'pending' }));
    setShowApprovalModal(false);
    onShowToast?.(`Access request for non-college contact "${pendingTargetPeer.displayName || pendingTargetPeer.email}" submitted to Admin for approval.`, "info");
    
    setTimeout(() => {
      setApprovalStatuses(prev => ({ ...prev, [pendingTargetPeer.id]: 'approved' }));
      setSelectedPeerId(pendingTargetPeer.id);
      onShowToast?.(`Admin approved access for non-college contact "${pendingTargetPeer.displayName || pendingTargetPeer.email}"!`, "success");
    }, 4000);
  };

  // Handle Send SMS Open Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPeerId) return;

    if (!currentUser) {
      onShowToast?.("Please sign in to send SMS open chat messages", "error");
      return;
    }

    const targetPeer = users.find(u => u.id === selectedPeerId);
    if (targetPeer && isNonCollegePeer(targetPeer) && approvalStatuses[targetPeer.id] !== 'approved') {
      onShowToast?.("Non-college communication requires mandatory Admin approval first.", "error");
      setPendingTargetPeer(targetPeer);
      setShowApprovalModal(true);
      return;
    }

    setIsSending(true);
    try {
      let attachments = null;
      if (attachVitals) {
        attachments = {
          bloodPressure: "120/80 mmHg",
          heartRate: "76 bpm",
          spo2: "99%",
          temperature: "36.7 °C",
          deviceSource: "Doctorian Sensor Pod v4"
        };
      }

      await api.network.sendMessage({
        recipientId: selectedPeerId,
        recipientName: targetPeer ? (targetPeer.displayName || targetPeer.email) : 'Clinical Contact',
        channel: 'direct',
        content: messageText.trim(),
        subject: messageSubject.trim() || undefined,
        messageType: 'text',
        attachments,
        priority: messagePriority
      });

      setMessageText('');
      setMessageSubject('');
      setAttachVitals(false);
      setMessagePriority('normal');
      onShowToast?.("SMS Open Chat message transmitted securely", "success");
      await loadMessages();
    } catch (err: any) {
      onShowToast?.(err.message || "Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesDir = 
      activeDirectory === 'doctors' ? u.isDoctor :
      activeDirectory === 'admin' ? u.isAdmin :
      !u.isDoctor && !u.isAdmin;

    const matchesSearch = 
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.specialty?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDir && matchesSearch;
  });

  const selectedPeerUser = users.find(u => u.id === selectedPeerId);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 select-none font-sans">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* NOTIFICATION CENTER WIDGET OS HEADER (Matched to image_3bc9bce0.png) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Radio size={28} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  NOTIFICATION CENTER OS
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span className="text-cyan-400">SMS Open Chat Mesh</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Doctorian AI Health Systems — Strict Directory Routing & Admin Clearance Protocol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl flex items-center gap-3 shadow-inner">
              <div className="text-right">
                <div className="text-sm font-black text-cyan-400">24°C Kampala</div>
                <div className="text-[10px] text-slate-400 font-mono">SECURE MESH ACTIVE</div>
              </div>
              <Building2 size={22} className="text-blue-400" />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* THREE DIRECTORY SELECTOR BUTTONS (Patients, Doctors, Admin) */}
        {/* ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleDirectorySwitch('patients')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeDirectory === 'patients'
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/40'
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${activeDirectory === 'patients' ? 'bg-white/20 text-white' : 'bg-blue-950 text-cyan-400'}`}>
              <Users size={18} />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider">Patients Directory</div>
              <div className={`text-[10px] mt-0.5 ${activeDirectory === 'patients' ? 'text-blue-100' : 'text-slate-400'}`}>
                Patient SMS open chat queue
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDirectorySwitch('doctors')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeDirectory === 'doctors'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${activeDirectory === 'doctors' ? 'bg-white/20 text-white' : 'bg-emerald-950 text-emerald-400'}`}>
              <Stethoscope size={18} />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider">Doctors Directory</div>
              <div className={`text-[10px] mt-0.5 ${activeDirectory === 'doctors' ? 'text-emerald-100' : 'text-slate-400'}`}>
                Verified clinicians & specialists
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDirectorySwitch('admin')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeDirectory === 'admin'
                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40'
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${activeDirectory === 'admin' ? 'bg-white/20 text-white' : 'bg-purple-950 text-purple-400'}`}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider">Admin Directory</div>
              <div className={`text-[10px] mt-0.5 ${activeDirectory === 'admin' ? 'text-purple-100' : 'text-slate-400'}`}>
                System admins & approval desk
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MAIN TWO-COLUMN SMS OPEN CHAT WORKSPACE                     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Directory Peer List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-blue-600 dark:text-cyan-400" />
              <span>{activeDirectory.toUpperCase()} Directory</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              {filteredUsers.length} AVAILABLE
            </span>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto no-scrollbar pr-0.5">
            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No contacts found in this directory.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedPeerId === u.id;
                const isExternal = isNonCollegePeer(u);
                const approvalStatus = approvalStatuses[u.id];

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectPeer(u)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 shadow-sm'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        {u.displayName ? u.displayName.slice(0, 2).toUpperCase() : 'DR'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {u.displayName || u.email}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {u.specialty || u.role || 'Member'}
                        </div>
                      </div>
                    </div>

                    {isExternal && (
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        approvalStatus === 'approved' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : approvalStatus === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {approvalStatus === 'approved' ? 'Cleared' : approvalStatus === 'pending' ? 'Admin Pending' : 'Non-College'}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: SMS Open Chat Stream & Composer */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[580px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  SMS Open Chat: {selectedPeerUser ? (selectedPeerUser.displayName || selectedPeerUser.email) : 'Select Contact'}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Doctorian AI Secured Messaging — Strictly Patient to Doctor / Admin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadMessages}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[380px] space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Radio size={36} className="text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  No SMS Open Chat History
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  Send an SMS message below. Non-college contacts require prior Admin approval.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMyMessage = currentUser && m.senderId === currentUser.id;

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500">
                      <span className="font-bold">{m.senderName}</span>
                      <span>•</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className={`p-3.5 sm:p-4 rounded-2xl max-w-lg border shadow-xs ${
                      isMyMessage
                        ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}>
                      {m.subject && (
                        <div className={`text-xs font-black uppercase pb-1 mb-1 border-b ${isMyMessage ? 'border-blue-400/50 text-blue-100' : 'border-slate-100 dark:border-slate-700 text-cyan-400'}`}>
                          {m.subject}
                        </div>
                      )}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
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
                  <span>Attach Telemetry</span>
                  {attachVitals && <Check size={11} />}
                </button>

                <select
                  value={messagePriority}
                  onChange={(e: any) => setMessagePriority(e.target.value)}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="normal">Normal SMS</option>
                  <option value="urgent">Urgent SMS</option>
                  <option value="stat_emergency">STAT Emergency</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              placeholder="SMS Subject / Title (optional)..."
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
            />

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your SMS open chat message to doctor or admin..."
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={isSending || !messageText.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
              >
                <span>Send SMS</span>
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Admin Approval Modal for Non-College Contacts */}
      <AnimatePresence>
        {showApprovalModal && pendingTargetPeer && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-red-500" />
              
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
                <ShieldAlert size={24} />
              </div>

              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">
                Mandatory Admin Approval Required
              </h3>
              
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                You are attempting to contact <span className="font-bold text-cyan-400">{pendingTargetPeer.displayName || pendingTargetPeer.email}</span>, who is classified as a <span className="text-amber-400 font-bold">non-college / external contact</span>. 
              </p>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 mb-6 text-[11px] text-slate-300">
                <div className="font-bold text-amber-400 uppercase tracking-wider mb-1">Doctorian Protocol:</div>
                Per institutional security rules, all requests to communicate with non-college individuals must first be submitted to the Admin desk for clearance and approval.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={requestAdminApprovalForNonCollege}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
                >
                  Submit to Admin
                </button>
              </div>

              <div className="text-[10px] text-slate-500 text-center mt-4">
                Doctorian AI Health Systems © Copyright Protected
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
