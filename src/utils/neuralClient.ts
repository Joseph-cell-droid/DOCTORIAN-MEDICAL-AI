/**
 * Doctorian Client Neural Communication Mesh
 * Connects to /ws/neural WebSocket for real-time Patient <-> Doctor <-> Admin <-> Pharmacy sync,
 * relays cross-tab events instantly via BroadcastChannel, and queues outbound signals in the
 * Offline Vault when disconnected for automatic background replay on reconnect.
 */

import { enqueueOutboxItem, getOutboxItems, replaceOutboxItems } from './offlineVault';

export type ClientSignalType =
  | 'signal'
  | 'chat'
  | 'alarm'
  | 'sensor'
  | 'alert'
  | 'order'
  | 'billing'
  | 'clinical_note'
  | 'prescription'
  | 'referral'
  | 'lab_order'
  | 'sync';

export interface NeuralSignalPacket {
  id: string;
  channel: string;
  eventType: ClientSignalType;
  senderId: string;
  senderName: string;
  senderRole: string;
  targetRole: string;
  recipientId?: string;
  subject?: string;
  content: string;
  payload?: any;
  priority: 'normal' | 'urgent' | 'stat_emergency';
  createdAt: string;
  offlineQueued?: boolean;
}

const LOCAL_SIGNALS_KEY = 'doctorian_neural_signals_cache_v1';
const CHANNEL_NAME = 'doctorian_neural_mesh';

let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let heartbeatTimer: number | null = null;
let bc: BroadcastChannel | null = null;
let started = false;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!bc) {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event?.data?.signal) {
        persistLocalSignal(event.data.signal);
        window.dispatchEvent(new CustomEvent('doctorian-neural-signal', { detail: event.data.signal }));
      } else if (event?.data?.callSignal) {
        window.dispatchEvent(new CustomEvent('doctorian-call-signal', { detail: event.data.callSignal }));
      }
    };
  }
  return bc;
}

export function getCachedNeuralSignals(): NeuralSignalPacket[] {
  try {
    const raw = localStorage.getItem(LOCAL_SIGNALS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistLocalSignal(signal: NeuralSignalPacket) {
  try {
    const list = getCachedNeuralSignals().filter((s) => s.id !== signal.id);
    const next = [...list, signal].slice(-80);
    localStorage.setItem(LOCAL_SIGNALS_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }
}

function emitLocalSignal(signal: NeuralSignalPacket) {
  persistLocalSignal(signal);
  try {
    getBroadcastChannel()?.postMessage({ signal });
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('doctorian-neural-signal', { detail: signal }));
  }
}

function connectSocket() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('medical_forced_offline') === 'true' || navigator.onLine === false) return;
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  try {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = localStorage.getItem('doctorian_token');
    const url = `${proto}//${window.location.host}/ws/neural${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    socket = new WebSocket(url);

    socket.onopen = () => {
      window.dispatchEvent(new CustomEvent('doctorian-neural-status', { detail: { connected: true } }));
      void flushNeuralOutbox();
      if (heartbeatTimer) window.clearInterval(heartbeatTimer);
      heartbeatTimer = window.setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25000);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'neural:connected' && Array.isArray(data.recentSignals)) {
          data.recentSignals.forEach((sig: NeuralSignalPacket) => persistLocalSignal(sig));
          window.dispatchEvent(new CustomEvent('doctorian-neural-hydrated', { detail: data.recentSignals }));
        } else if (typeof data?.type === 'string' && data.type.startsWith('call:')) {
          window.dispatchEvent(new CustomEvent('doctorian-call-signal', { detail: data }));
        } else if (data?.signal) {
          emitLocalSignal(data.signal);
        }
      } catch {
        // ignore malformed frames
      }
    };

    socket.onclose = () => {
      window.dispatchEvent(new CustomEvent('doctorian-neural-status', { detail: { connected: false } }));
      if (heartbeatTimer) {
        window.clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      if (!reconnectTimer) {
        reconnectTimer = window.setTimeout(() => {
          reconnectTimer = null;
          connectSocket();
        }, 4000);
      }
    };

    socket.onerror = () => {
      try {
        socket?.close();
      } catch {
        // ignore
      }
    };
  } catch {
    // WebSocket blocked or offline -> gracefully stay in offline/BroadcastChannel mesh mode
  }
}

export function startNeuralMeshClient() {
  if (typeof window === 'undefined' || started) return;
  started = true;
  getBroadcastChannel();
  connectSocket();

  window.addEventListener('online', () => {
    connectSocket();
    void flushNeuralOutbox();
  });
  window.addEventListener('offline_forced_changed', () => {
    if (localStorage.getItem('medical_forced_offline') !== 'true' && navigator.onLine) {
      connectSocket();
      void flushNeuralOutbox();
    } else if (socket) {
      try { socket.close(); } catch {}
    }
  });
}

export function reconnectNeuralMeshClient() {
  if (socket) {
    try { socket.close(); } catch {}
    socket = null;
  }
  connectSocket();
}

export function sendCallSignal(frame: {
  type: 'call:invite' | 'call:ringing' | 'call:accept' | 'call:offer' | 'call:answer' | 'call:ice' | 'call:hangup';
  roomId: string;
  mode?: 'video' | 'voice';
  targetRole?: string;
  targetUserId?: string;
  fromName?: string;
  payload?: any;
}) {
  if (typeof window === 'undefined') return;
  let userMeta: any = null;
  try {
    const raw = localStorage.getItem('medical_user');
    userMeta = raw ? JSON.parse(raw) : null;
  } catch {}

  const fullFrame = {
    ...frame,
    fromUserId: userMeta?.id || 'local-node',
    fromName: frame.fromName || userMeta?.displayName || 'Patient Node',
    fromRole: userMeta?.role || 'patient',
    ts: Date.now()
  };

  try {
    getBroadcastChannel()?.postMessage({ callSignal: fullFrame });
  } catch {}

  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify(fullFrame));
    } catch {}
  }
}

export async function sendNeuralSignal(input: {
  channel?: string;
  eventType: ClientSignalType;
  targetRole?: 'all' | 'patient' | 'doctor' | 'nurse' | 'admin';
  targetUserId?: string;
  subject?: string;
  content: string;
  payload?: any;
  priority?: 'normal' | 'urgent' | 'stat_emergency';
  senderName?: string;
  senderRole?: string;
  senderId?: string;
}): Promise<NeuralSignalPacket> {
  let userMeta: any = null;
  try {
    const raw = localStorage.getItem('medical_user');
    userMeta = raw ? JSON.parse(raw) : null;
  } catch {
    // ignore
  }

  const localPacket: NeuralSignalPacket = {
    id: `sig-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    channel: input.channel || 'neural_mesh',
    eventType: input.eventType,
    senderId: input.senderId || userMeta?.id || 'local-device',
    senderName: input.senderName || userMeta?.displayName || 'Clinical Node',
    senderRole: input.senderRole || userMeta?.role || 'patient',
    targetRole: input.targetRole || 'all',
    recipientId: input.targetUserId,
    subject: input.subject,
    content: input.content,
    payload: input.payload,
    priority: input.priority || 'normal',
    createdAt: new Date().toISOString()
  };

  // Emit locally & across browser tabs immediately for instant UI responsiveness
  emitLocalSignal(localPacket);

  const forcedOffline = localStorage.getItem('medical_forced_offline') === 'true';
  if (forcedOffline || navigator.onLine === false) {
    localPacket.offlineQueued = true;
    enqueueOutboxItem({
      kind: 'neural_signal',
      endpoint: '/api/neural/signal',
      method: 'POST',
      payload: input
    });
    return localPacket;
  }

  try {
    const res = await fetch('/api/neural/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include'
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.signal) {
        persistLocalSignal(json.signal);
        return json.signal;
      }
    }
    throw new Error('Server signal delivery deferred');
  } catch {
    localPacket.offlineQueued = true;
    enqueueOutboxItem({
      kind: 'neural_signal',
      endpoint: '/api/neural/signal',
      method: 'POST',
      payload: input
    });
    return localPacket;
  }
}

export async function flushNeuralOutbox(): Promise<number> {
  if (typeof window === 'undefined' || localStorage.getItem('medical_forced_offline') === 'true' || navigator.onLine === false) {
    return 0;
  }
  const items = getOutboxItems();
  if (items.length === 0) return 0;

  const remaining = [];
  let synced = 0;

  for (const item of items) {
    try {
      const res = await fetch(item.endpoint, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
        credentials: 'include'
      });
      if (res.ok) {
        synced += 1;
      } else if (res.status >= 400 && res.status < 500) {
        // Drop invalid/unrecoverable client error payloads rather than infinite retry loops
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  replaceOutboxItems(remaining);
  if (synced > 0) {
    window.dispatchEvent(new CustomEvent('offline_actions_synced', { detail: { syncedCount: synced } }));
  }
  return synced;
}
