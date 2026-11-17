import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  Send,
  Check,
  CheckCheck,
  AlertTriangle,
  Radio,
  WifiOff,
  Megaphone,
  Volume2,
  VolumeX,
  ArrowUpRight,
  X
} from 'lucide-react';
import { api, User } from '../api';
import {
  ClientSignalType,
  NeuralSignalPacket,
  getCachedNeuralSignals,
  sendNeuralSignal
} from '../utils/neuralClient';

interface LiveAlarmNotificationItem {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderRole: string;
  targetRole: string;
  eventType: ClientSignalType | string;
  priority: 'normal' | 'urgent' | 'stat_emergency';
  createdAt: string;
  offlineQueued?: boolean;
  targetView?: string;
}

interface LiveAlarmNotificationCenterProps {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onNavigate: (view: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onUnreadChange?: (count: number) => void;
  hideTrigger?: boolean;
}

const READ_IDS_STORAGE_KEY = 'doctorian_read_notification_ids_v1';

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    const trimmed = Array.from(ids).slice(-250);
    localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage quota
  }
}

function playLiveNotificationTone(priority: 'normal' | 'urgent' | 'stat_emergency') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (priority === 'stat_emergency') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1046.5, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.24);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.start(now);
      osc.stop(now + 0.44);
    } else if (priority === 'urgent') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, now);
      osc.frequency.setValueAtTime(987.77, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 650);
  } catch {
    // Audio playback skipped if browser blocks autoplay
  }
}

function formatRelativeTime(isoString: string): string {
  const ts = new Date(isoString).getTime();
  if (Number.isNaN(ts)) return 'Live';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function inferTargetView(sig: {
  eventType?: string;
  channel?: string;
  subject?: string;
  content?: string;
  payload?: any;
}): string {
  if (sig.payload?.targetView) return String(sig.payload.targetView);
  const text = `${sig.subject || ''} ${sig.content || ''}`.toLowerCase();
  if (sig.eventType === 'order' || text.includes('pharmacy') || text.includes('order')) return 'meds';
  if (sig.eventType === 'lab_order' || text.includes('lab') || text.includes('blood sugar')) return 'diagnostic_lab';
  if (sig.eventType === 'alarm' || text.includes('emergency') || text.includes('triage')) return 'emergency';
  if (sig.eventType === 'sensor' || text.includes('spo2') || text.includes('vital')) return 'vitality';
  if (sig.eventType === 'prescription' || text.includes('dose') || text.includes('medication')) return 'meds';
  if (text.includes('appointment') || text.includes('consult')) return 'clinical_roadmap';
  return 'server_network';
}

function mapNeuralToNotification(sig: NeuralSignalPacket): LiveAlarmNotificationItem {
  return {
    id: sig.id,
    title:
      sig.subject ||
      (sig.eventType === 'alarm'
        ? 'Clinical Alarm Alert'
        : sig.eventType === 'order'
        ? 'E-Pharmacy Dispatch'
        : sig.eventType === 'sensor'
        ? 'Live Biometric Flag'
        : sig.eventType === 'prescription'
        ? 'Medication Notice'
        : 'Live Clinical Notification'),
    content: sig.content,
    senderName: sig.senderName || 'Doctorian Core',
    senderRole: sig.senderRole || 'system',
    targetRole: sig.targetRole || 'all',
    eventType: sig.eventType || 'alert',
    priority: sig.priority || 'normal',
    createdAt: sig.createdAt || new Date().toISOString(),
    offlineQueued: sig.offlineQueued,
    targetView: inferTargetView(sig)
  };
}

export const LiveAlarmNotificationCenter: React.FC<LiveAlarmNotificationCenterProps> = ({
  user,
  isOpen,
  onToggle,
  onClose,
  onNavigate,
  addToast,
  onUnreadChange,
  hideTrigger = false
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'send'>('feed');
  const [filterMode, setFilterMode] = useState<'all' | 'urgent' | 'clinical'>('all');
  const [items, setItems] = useState<LiveAlarmNotificationItem[]>(() => {
    const cached = getCachedNeuralSignals();
    return cached.slice().reverse().map(mapNeuralToNotification);
  });
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());
  const [isMeshConnected, setIsMeshConnected] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isRinging, setIsRinging] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('doctorian_live_notif_sound') !== 'false';
    } catch {
      return true;
    }
  });

  // Live Sender State
  const [targetRole, setTargetRole] = useState<'all' | 'patient' | 'doctor' | 'admin'>('all');
  const [signalType, setSignalType] = useState<ClientSignalType>('alert');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'stat_emergency'>('urgent');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const ringTimeoutRef = useRef<number | null>(null);

  const triggerBellRing = (itemPriority: 'normal' | 'urgent' | 'stat_emergency') => {
    setIsRinging(true);
    if (ringTimeoutRef.current) window.clearTimeout(ringTimeoutRef.current);
    ringTimeoutRef.current = window.setTimeout(() => setIsRinging(false), 1900);

    if (soundEnabled) {
      playLiveNotificationTone(itemPriority);
    }
  };

  // Merge incoming notifications cleanly without duplicates
  const upsertNotifications = (incoming: LiveAlarmNotificationItem[], prepend = true) => {
    setItems((prev) => {
      const map = new Map<string, LiveAlarmNotificationItem>();
      if (prepend) {
        for (const item of incoming) map.set(item.id, item);
        for (const item of prev) if (!map.has(item.id)) map.set(item.id, item);
      } else {
        for (const item of prev) map.set(item.id, item);
        for (const item of incoming) map.set(item.id, item);
      }
      return Array.from(map.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 60);
    });
  };

  useEffect(() => {
    let mounted = true;

    const hydrateInitial = async () => {
      // 1. Fetch live neural events from server
      try {
        if (navigator.onLine && localStorage.getItem('medical_forced_offline') !== 'true') {
          const res = await fetch('/api/neural/events?limit=40', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (mounted && Array.isArray(data.signals)) {
              upsertNotifications(data.signals.map(mapNeuralToNotification), true);
            }
          }
        }
      } catch {
        // Stay gracefully on cached offline signals
      }

      // 2. Also include persistent local/seeded clinical notifications if feed is light
      try {
        const localNotifs = await api.notifications.list();
        if (mounted && Array.isArray(localNotifs) && localNotifs.length > 0) {
          const mapped: LiveAlarmNotificationItem[] = localNotifs.slice(0, 12).map((n: any) => ({
            id: String(n.id || `local-notif-${n.title}`),
            title: n.title || 'Clinical Update',
            content: n.content || n.message || '',
            senderName: 'Doctorian Clinical Guardian',
            senderRole: 'system',
            targetRole: 'all',
            eventType: n.type === 'warning' ? 'alarm' : 'alert',
            priority: n.type === 'warning' ? 'urgent' : 'normal',
            createdAt: n.createdAt || n.timestamp || new Date().toISOString(),
            targetView: inferTargetView({ subject: n.title, content: n.content })
          }));
          upsertNotifications(mapped, false);
        }
      } catch {
        // ignore fallback read issues
      }
    };

    void hydrateInitial();

    const handleLiveSignal = (ev: Event) => {
      const sig = (ev as CustomEvent<NeuralSignalPacket>).detail;
      if (!sig || !sig.id) return;
      const mapped = mapNeuralToNotification(sig);
      upsertNotifications([mapped], true);
      triggerBellRing(mapped.priority);

      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        window.Notification.permission === 'granted' &&
        sig.senderId !== user.id
      ) {
        try {
          new window.Notification(mapped.title, {
            body: `${mapped.senderName}: ${mapped.content}`,
            icon: '/logo.png'
          });
        } catch {
          // ignore notification API restrictions inside sandboxed frames
        }
      }
    };

    const handleHydrated = (ev: Event) => {
      const signals = (ev as CustomEvent<NeuralSignalPacket[]>).detail;
      if (!Array.isArray(signals)) return;
      upsertNotifications(signals.map(mapNeuralToNotification), true);
    };

    const handleMeshStatus = (ev: Event) => {
      const connected = Boolean((ev as CustomEvent<{ connected: boolean }>).detail?.connected);
      setIsMeshConnected(connected);
    };

    window.addEventListener('doctorian-neural-signal', handleLiveSignal);
    window.addEventListener('doctorian-neural-hydrated', handleHydrated);
    window.addEventListener('doctorian-neural-status', handleMeshStatus);

    return () => {
      mounted = false;
      if (ringTimeoutRef.current) window.clearTimeout(ringTimeoutRef.current);
      window.removeEventListener('doctorian-neural-signal', handleLiveSignal);
      window.removeEventListener('doctorian-neural-hydrated', handleHydrated);
      window.removeEventListener('doctorian-neural-status', handleMeshStatus);
    };
  }, [user.id, soundEnabled]);

  const unreadCount = useMemo(
    () => items.filter((item) => !readIds.has(item.id)).length,
    [items, readIds]
  );

  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [unreadCount, onUnreadChange]);

  const filteredItems = useMemo(() => {
    if (filterMode === 'urgent') {
      return items.filter((i) => i.priority === 'urgent' || i.priority === 'stat_emergency' || i.eventType === 'alarm');
    }
    if (filterMode === 'clinical') {
      return items.filter((i) => ['alarm', 'sensor', 'prescription', 'lab_order', 'order', 'clinical_note'].includes(i.eventType));
    }
    return items;
  }, [items, filterMode]);

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllAsRead = () => {
    const next = new Set(readIds);
    items.forEach((item) => next.add(item.id));
    setReadIds(next);
    saveReadIds(next);
    addToast('All live notifications marked as read.', 'success');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('doctorian_live_notif_sound', next ? 'true' : 'false');
    } catch {}
    addToast(next ? 'Live notification sound chime enabled.' : 'Notification sound muted.', 'info');
  };

  const handleRequestBrowserPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast('Device notifications active inside Doctorian Live Feed.', 'info');
      return;
    }
    try {
      const perm = await window.Notification.requestPermission();
      if (perm === 'granted') {
        addToast('Browser push notifications enabled for urgent alerts.', 'success');
      } else {
        addToast('In-app live notification alerts remain active.', 'info');
      }
    } catch {
      addToast('In-app live notification alerts are active.', 'info');
    }
  };

  const handleSendLiveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanContent = message.trim();
    const cleanSubject =
      subject.trim() ||
      (signalType === 'alarm'
        ? 'Clinical Alarm Broadcast'
        : signalType === 'prescription'
        ? 'Medication & Dosage Update'
        : 'Live Clinical Information');

    if (!cleanContent) {
      addToast('Enter a notification message to broadcast.', 'error');
      return;
    }

    setIsSending(true);
    try {
      const dispatched = await sendNeuralSignal({
        channel: signalType === 'alarm' ? 'clinical_alerts' : 'neural_mesh',
        eventType: signalType,
        targetRole,
        subject: cleanSubject,
        content: cleanContent,
        priority,
        senderName: user.displayName || 'Clinical User',
        senderRole: user.role || 'patient',
        senderId: user.id
      });

      // Also record in offline-resilient notification archive
      void api.notifications.create({
        title: cleanSubject,
        content: `${cleanContent} — Sent by ${user.displayName || 'User'}`,
        type: priority === 'normal' ? 'info' : 'warning'
      }).catch(() => {});

      // Sender has already seen their own outgoing message, mark read automatically for self
      markAsRead(dispatched.id);

      setSubject('');
      setMessage('');
      setActiveTab('feed');
      addToast(
        dispatched.offlineQueued
          ? 'Notification queued locally — will auto-broadcast when online.'
          : 'Live notification sent to connected users!',
        'success'
      );
    } catch {
      addToast('Could not dispatch notification right now.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const applyQuickTemplate = (tplTitle: string, tplBody: string, tplType: ClientSignalType, tplPriority: 'normal' | 'urgent' | 'stat_emergency') => {
    setSubject(tplTitle);
    setMessage(tplBody);
    setSignalType(tplType);
    setPriority(tplPriority);
  };

  const hasUrgentUnread = items.some(
    (item) => !readIds.has(item.id) && (item.priority === 'stat_emergency' || item.priority === 'urgent')
  );

  return (
    <div className={hideTrigger ? '' : 'relative shrink-0'}>
      {!hideTrigger && (
        <button
          type="button"
          onClick={onToggle}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-2xs relative shrink-0 ${
            hasUrgentUnread
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-500/50 text-rose-600 dark:text-rose-300'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
          }`}
          title={
            unreadCount > 0
              ? `${unreadCount} unread live notifications — Click to view or send`
              : 'Live Notifications & Alert Broadcast'
          }
          aria-label="Live Clinical Notifications"
          aria-expanded={isOpen}
        >
          {hasUrgentUnread || isRinging ? (
            <BellRing
              size={15}
              className={`${isRinging ? 'doctorian-alarm-ring' : ''} ${
                hasUrgentUnread ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-300'
              }`}
            />
          ) : (
            <Bell size={15} className="text-slate-700 dark:text-slate-200" />
          )}

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white font-black text-[9px] leading-none flex items-center justify-center shadow-sm tabular-nums ring-2 ring-white dark:ring-slate-950">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <div className={`fixed inset-0 ${hideTrigger ? 'z-[145] bg-slate-950/55 backdrop-blur-xs' : 'z-40'}`} onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className={
                hideTrigger
                  ? 'fixed left-3 right-3 bottom-20 sm:left-auto sm:right-6 sm:bottom-24 sm:w-[420px] bg-white dark:bg-[#07112a] rounded-3xl shadow-2xl border border-slate-200 dark:border-cyan-500/30 overflow-hidden z-[150]'
                  : 'fixed left-2.5 right-2.5 top-14 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[410px] bg-white dark:bg-[#07112a] rounded-3xl shadow-2xl border border-slate-200 dark:border-cyan-500/25 overflow-hidden z-50'
              }
            >
              {/* Header & Mode Switcher */}
              <div className="px-4 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 space-y-2.5 bg-slate-50/70 dark:bg-[#0a183b]/70">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-300 shrink-0">
                      <BellRing size={15} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                        Live Notifications
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {isMeshConnected ? (
                          <>
                            <Radio size={10} className="text-emerald-500 shrink-0" />
                            <span>Live Neural Dispatch</span>
                          </>
                        ) : (
                          <>
                            <WifiOff size={10} className="text-amber-500 shrink-0" />
                            <span>Offline Queue Mode</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{unreadCount} unread</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleToggleSound}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={soundEnabled ? 'Mute notification chimes' : 'Enable notification chimes'}
                      aria-label="Toggle notification sound"
                    >
                      {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label="Close notifications"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Segmented Tabs: Incoming Feed vs Send Live Notification */}
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('feed')}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'feed'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Bell size={12} />
                    <span>Live Feed ({items.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('send')}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'send'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Send size={12} />
                    <span>Send Notification</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: LIVE FEED */}
              {activeTab === 'feed' ? (
                <div>
                  {/* Filter Bar */}
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between gap-2 bg-white dark:bg-[#07112a]">
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: 'all', label: 'All' },
                          { id: 'urgent', label: 'Urgent' },
                          { id: 'clinical', label: 'Clinical' }
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setFilterMode(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                            filterMode === tab.id
                              ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestBrowserPush}
                      className="text-[10px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Device Push
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/70 max-h-[310px] overflow-y-auto custom-scrollbar px-2">
                    {filteredItems.length === 0 ? (
                      <div className="py-10 px-4 text-center space-y-2">
                        <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          No notifications in this filter yet
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('send')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold cursor-pointer hover:bg-cyan-500/25 transition-colors"
                        >
                          <Megaphone size={12} />
                          <span>Send a Live Notification</span>
                        </button>
                      </div>
                    ) : (
                      filteredItems.map((item) => {
                        const isUnread = !readIds.has(item.id);
                        const isStat = item.priority === 'stat_emergency';
                        const isUrgent = item.priority === 'urgent' || item.eventType === 'alarm';

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              markAsRead(item.id);
                              if (item.targetView) {
                                onNavigate(item.targetView);
                              }
                              onClose();
                            }}
                            className={`py-2.5 px-2.5 my-1 rounded-2xl transition-colors cursor-pointer ${
                              isUnread
                                ? 'bg-cyan-50/60 dark:bg-cyan-950/25 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {isStat ? (
                                  <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                                ) : isUrgent ? (
                                  <BellRing size={13} className="text-amber-500 shrink-0" />
                                ) : (
                                  <Bell size={13} className="text-cyan-500 shrink-0" />
                                )}
                                <span
                                  className={`text-[11px] font-extrabold truncate ${
                                    isStat
                                      ? 'text-rose-600 dark:text-rose-400'
                                      : isUrgent
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-blue-600 dark:text-cyan-300'
                                  }`}
                                >
                                  {item.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-medium text-slate-400 tabular-nums">
                                  {formatRelativeTime(item.createdAt)}
                                </span>
                                {isUnread && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(item.id);
                                    }}
                                    className="w-5 h-5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-cyan-600 dark:text-cyan-300"
                                    title="Mark as read"
                                    aria-label="Mark notification as read"
                                  >
                                    <Check size={11} />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-snug mt-1 line-clamp-2">
                              {item.content}
                            </p>

                            <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="truncate">
                                From {item.senderName} ({item.senderRole})
                                {item.offlineQueued ? ' · Queued Offline' : ''}
                              </span>
                              <span className="inline-flex items-center gap-0.5 font-semibold text-blue-600 dark:text-cyan-400 shrink-0">
                                Open <ArrowUpRight size={10} />
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-[#0a183b]/70">
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 cursor-pointer"
                    >
                      <CheckCheck size={13} />
                      <span>Mark All Read</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('send')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-bold shadow-xs hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Send size={11} />
                      <span>Broadcast Info</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* TAB 2: SEND LIVE NOTIFICATION */
                <form onSubmit={handleSendLiveNotification} className="p-4 space-y-3">
                  {/* Quick One-Tap Templates */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Quick Presets
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          applyQuickTemplate(
                            'Urgent Clinical Update',
                            'Please review the latest patient vitals and laboratory report immediately.',
                            'alarm',
                            'urgent'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Urgent Review
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          applyQuickTemplate(
                            'Medication Reminder',
                            'Scheduled medication administration window is now active.',
                            'prescription',
                            'normal'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Dose Reminder
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          applyQuickTemplate(
                            'STAT Emergency Alert',
                            'Immediate clinical response requested at triage station.',
                            'alarm',
                            'stat_emergency'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        STAT Alert
                      </button>
                    </div>
                  </div>

                  {/* Audience & Priority Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        Recipients
                      </span>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="all">All Users</option>
                        <option value="doctor">Doctors & Nurses</option>
                        <option value="patient">Patients</option>
                        <option value="admin">Administrators</option>
                      </select>
                    </label>

                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        Priority
                      </span>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="normal">Normal Notice</option>
                        <option value="urgent">Urgent Alert</option>
                        <option value="stat_emergency">STAT Emergency</option>
                      </select>
                    </label>
                  </div>

                  {/* Subject */}
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      Alert Title
                    </span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Clinic Schedule Update or Patient Flag"
                      maxLength={80}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
                    />
                  </label>

                  {/* Message Body */}
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      Notification Message
                    </span>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write the exact information users need to see right now..."
                      maxLength={500}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 resize-none"
                    />
                  </label>

                  {/* Submit Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('feed')}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Back to Feed
                    </button>
                    <button
                      type="submit"
                      disabled={isSending || !message.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-extrabold shadow-md hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Send size={13} />
                      <span>{isSending ? 'Sending...' : 'Send Live Notification'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
