import type http from 'http';
import type { IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { db, logAudit } from './db.ts';
import { SERVER_SECRETS, isTrackedSessionValid } from './security.ts';

export type NeuralSignalType =
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

export interface NeuralSignalInput {
  channel?: string;
  eventType: NeuralSignalType;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderSpecialty?: string;
  targetRole?: 'all' | 'patient' | 'doctor' | 'nurse' | 'admin';
  targetUserId?: string | null;
  recipientName?: string | null;
  subject?: string;
  content: string;
  payload?: Record<string, any>;
  priority?: 'normal' | 'urgent' | 'stat_emergency';
  skipSelfLoop?: boolean;
}

export interface PersistedNeuralMessage {
  id: string;
  channel: string;
  eventType: NeuralSignalType;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderSpecialty?: string;
  recipientId: string;
  recipientName?: string;
  targetRole: string;
  subject?: string;
  content: string;
  messageType: string;
  attachments?: any;
  payload?: Record<string, any>;
  priority: 'normal' | 'urgent' | 'stat_emergency';
  isRead: number;
  createdAt: string;
}

interface NeuralSocketMeta {
  ws: WebSocket;
  userId: string;
  role: string;
  displayName: string;
  connectedAt: number;
}

const activeClients = new Set<NeuralSocketMeta>();
let wssInstance: WebSocketServer | null = null;

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        out[k] = v;
      }
    }
  }
  return out;
}

function authenticateSocket(req: IncomingMessage): { userId: string; role: string; displayName: string } {
  try {
    const reqUrl = new URL(req.url || '/', 'http://localhost:3000');
    const queryToken = reqUrl.searchParams.get('token');
    const cookies = parseCookies(req.headers.cookie);
    const token = queryToken || cookies.doctorian_token;
    if (token) {
      const decoded = jwt.verify(token, SERVER_SECRETS.jwtSecret) as {
        id: string;
        role: string;
        displayName?: string;
        jti?: string;
      };
      if (isTrackedSessionValid(decoded.jti, decoded.id)) {
        return {
          userId: decoded.id,
          role: decoded.role || 'patient',
          displayName: decoded.displayName || 'Verified User'
        };
      }
    }
  } catch {
    // Fallback to anonymous observer node with minimal broadcast visibility
  }
  return {
    userId: `anon-${Math.random().toString(36).slice(2, 8)}`,
    role: 'guest',
    displayName: 'Clinical Node Observer'
  };
}

function mapRowToSignal(row: any): PersistedNeuralMessage {
  let parsedPayload: Record<string, any> | undefined;
  try {
    parsedPayload = row.payload_json ? JSON.parse(row.payload_json) : undefined;
  } catch {
    parsedPayload = undefined;
  }
  return {
    id: row.id,
    channel: row.channel,
    eventType: row.event_type,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderRole: row.sender_role,
    senderSpecialty: row.sender_specialty || undefined,
    recipientId: row.target_user_id || row.target_role || 'all',
    recipientName: row.recipient_name || undefined,
    targetRole: row.target_role || 'all',
    subject: row.subject || undefined,
    content: row.content,
    messageType: row.event_type,
    attachments: parsedPayload,
    payload: parsedPayload,
    priority: row.priority || 'normal',
    isRead: Number(row.is_read || 0),
    createdAt: row.created_at
  };
}

function broadcastToSockets(signal: PersistedNeuralMessage) {
  const frame = JSON.stringify({
    type: `neural:${signal.eventType}`,
    signal
  });

  for (const client of activeClients) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;

    // Role & recipient routing
    const isTargetedUser = signal.recipientId && signal.recipientId === client.userId;
    const isSender = signal.senderId === client.userId;
    const isAllBroadcast = signal.targetRole === 'all' && !signal.recipientId?.startsWith('usr-');
    const isRoleMatch = signal.targetRole === client.role || (signal.targetRole === 'doctor' && client.role === 'nurse');
    const isAdminObserver = client.role === 'admin';

    // Privacy guard: keep direct 1:1 chats private to sender, target, and admin oversight
    if (signal.channel === 'direct' && !isTargetedUser && !isSender && !isAdminObserver) {
      continue;
    }

    if (isTargetedUser || isSender || isAllBroadcast || isRoleMatch || isAdminObserver) {
      try {
        client.ws.send(frame);
      } catch {
        // Ignore broken pipes; close handler cleans up
      }
    }
  }
}

/**
 * Self-communicating Neural Router:
 * Persists a message/signal in SQLite, broadcasts it to active WebSocket nodes,
 * and allows the server to talk to itself to trigger autonomous clinical cascades
 * (e.g. sensor/alarm spike -> notify doctors & admin; pharmacy order -> ledger & dispatch alert).
 */
export function dispatchNeuralSignal(input: NeuralSignalInput): PersistedNeuralMessage {
  const id = `nsig-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const channel = input.channel || 'neural_mesh';
  const targetRole = input.targetRole || 'all';
  const priority = input.priority || 'normal';
  const payloadJson = input.payload ? JSON.stringify(input.payload) : null;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO neural_messages (
      id, channel, event_type, sender_id, sender_name, sender_role, sender_specialty,
      target_role, target_user_id, recipient_name, subject, content, payload_json, priority, is_read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    id,
    channel,
    input.eventType,
    input.senderId,
    input.senderName,
    input.senderRole,
    input.senderSpecialty || null,
    targetRole,
    input.targetUserId || null,
    input.recipientName || null,
    input.subject || null,
    input.content,
    payloadJson,
    priority,
    createdAt
  );

  const persisted: PersistedNeuralMessage = {
    id,
    channel,
    eventType: input.eventType,
    senderId: input.senderId,
    senderName: input.senderName,
    senderRole: input.senderRole,
    senderSpecialty: input.senderSpecialty,
    recipientId: input.targetUserId || targetRole,
    recipientName: input.recipientName || undefined,
    targetRole,
    subject: input.subject,
    content: input.content,
    messageType: input.eventType,
    attachments: input.payload,
    payload: input.payload,
    priority,
    isRead: 0,
    createdAt
  };

  broadcastToSockets(persisted);

  // Server-to-Self Autonomous Neural Reaction Loop
  if (!input.skipSelfLoop && input.senderId !== 'neural-core-server') {
    runAutonomousServerSelfLoop(persisted);
  }

  return persisted;
}

function runAutonomousServerSelfLoop(trigger: PersistedNeuralMessage) {
  try {
    // 1. Critical Alarms & Biometric Sensor Spikes -> Server routes escalation alert to clinicians & admins
    if (
      trigger.eventType === 'alarm' ||
      trigger.priority === 'stat_emergency' ||
      (trigger.eventType === 'sensor' &&
        (Number(trigger.payload?.spo2) > 0 && Number(trigger.payload?.spo2) < 92 ||
          Number(trigger.payload?.heartRate) > 130 ||
          Number(trigger.payload?.temperature) >= 39.2))
    ) {
      logAudit(
        'neural-core-server',
        'neural-mesh@doctorian.org',
        'system',
        'NEURAL_AUTO_ESCALATION',
        trigger.id,
        `Autonomous server escalation from ${trigger.eventType} (${trigger.senderName})`
      );

      dispatchNeuralSignal({
        channel: 'clinical_alerts',
        eventType: 'alert',
        senderId: 'neural-core-server',
        senderName: 'Doctorian Autonomous Neural Core',
        senderRole: 'system',
        targetRole: 'doctor',
        subject: `STAT Clinical Escalation: ${trigger.subject || trigger.eventType.toUpperCase()}`,
        content: `Server neural bus detected high-acuity ${trigger.eventType} from ${trigger.senderName}: "${trigger.content}". On-call physician & command admin alerted.`,
        payload: {
          sourceSignalId: trigger.id,
          sourceType: trigger.eventType,
          telemetry: trigger.payload || null,
          autoEscalated: true
        },
        priority: 'stat_emergency',
        skipSelfLoop: true
      });
    }

    // 2. E-Pharmacy Order -> Server talks to Billing & Pharmacy Dispatch channels automatically
    if (trigger.eventType === 'order') {
      dispatchNeuralSignal({
        channel: 'billing_ledger',
        eventType: 'billing',
        senderId: 'neural-core-server',
        senderName: 'Doctorian Pharmacy & Billing Engine',
        senderRole: 'system',
        targetRole: 'admin',
        subject: `New E-Pharmacy Transaction Logged (${trigger.payload?.orderNumber || trigger.id})`,
        content: `Pharmacy order ${trigger.payload?.orderNumber || ''} totaling UGX ${Number(trigger.payload?.totalUgx || 0).toLocaleString()} queued for ${trigger.payload?.pharmacyName || 'Partner Dispensary'}.`,
        payload: {
          sourceSignalId: trigger.id,
          orderNumber: trigger.payload?.orderNumber,
          totalUgx: trigger.payload?.totalUgx,
          pharmacyName: trigger.payload?.pharmacyName
        },
        priority: 'urgent',
        skipSelfLoop: true
      });
    }
  } catch (err) {
    console.warn('[Neural Bus] Autonomous self-loop warning:', err);
  }
}

export function getNeuralNetworkStats() {
  const totalMessages = (db.prepare('SELECT COUNT(*) as cnt FROM neural_messages').get() as { cnt: number }).cnt;
  const unreadCount = (db.prepare('SELECT COUNT(*) as cnt FROM neural_messages WHERE is_read = 0').get() as { cnt: number }).cnt;
  const totalUsers = (db.prepare('SELECT COUNT(*) as cnt FROM users WHERE status = \'active\'').get() as { cnt: number }).cnt;
  const totalDoctors = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE status = 'active' AND role IN ('doctor', 'nurse')").get() as { cnt: number }).cnt;
  const totalOrders = (db.prepare('SELECT COUNT(*) as cnt FROM pharmacy_orders').get() as { cnt: number }).cnt;

  return {
    totalMessages,
    unreadCount,
    totalUsers,
    totalDoctors,
    totalOrders,
    connectedSockets: activeClients.size,
    networkStatus: 'ONLINE_NEURAL_MESH',
    serverTime: new Date().toISOString()
  };
}

export function queryNeuralMessages(opts: {
  channel?: string;
  peerId?: string;
  eventType?: string;
  userId?: string;
  userRole?: string;
  limit?: number;
}): PersistedNeuralMessage[] {
  const conditions: string[] = [];
  const params: any[] = [];

  if (opts.channel) {
    conditions.push('channel = ?');
    params.push(opts.channel);
  }
  if (opts.eventType) {
    conditions.push('event_type = ?');
    params.push(opts.eventType);
  }
  if (opts.peerId && opts.userId) {
    conditions.push('((sender_id = ? AND target_user_id = ?) OR (sender_id = ? AND target_user_id = ?) OR target_user_id = ? OR sender_id = ?)');
    params.push(opts.userId, opts.peerId, opts.peerId, opts.userId, opts.peerId, opts.peerId);
  } else if (opts.peerId) {
    conditions.push('(target_user_id = ? OR sender_id = ?)');
    params.push(opts.peerId, opts.peerId);
  }

  // Enforce role visibility when user is patient/guest on non-admin routes
  if (opts.userRole === 'guest') {
    conditions.push("target_role = 'all' AND channel != 'direct'");
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = Math.min(200, Math.max(10, opts.limit || 80));

  const rows = db
    .prepare(`SELECT * FROM neural_messages ${whereSql} ORDER BY created_at DESC LIMIT ?`)
    .all(...params, limit) as any[];

  return rows.reverse().map(mapRowToSignal);
}

export function initNeuralBus(httpServer: http.Server) {
  if (wssInstance) return wssInstance;

  wssInstance = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    try {
      const reqUrl = new URL(request.url || '/', 'http://localhost:3000');
      if (reqUrl.pathname === '/ws/neural') {
        wssInstance!.handleUpgrade(request, socket, head, (ws) => {
          wssInstance!.emit('connection', ws, request);
        });
      }
      // Do NOT destroy sockets for other paths so Vite middleware doesn't error unexpectedly
    } catch {
      socket.destroy();
    }
  });

  wssInstance.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const auth = authenticateSocket(req);
    const meta: NeuralSocketMeta = {
      ws,
      userId: auth.userId,
      role: auth.role,
      displayName: auth.displayName,
      connectedAt: Date.now()
    };
    activeClients.add(meta);

    // Send initial connection acknowledgement & recent mesh signals
    try {
      const recent = queryNeuralMessages({ userId: auth.userId, userRole: auth.role, limit: 25 });
      ws.send(
        JSON.stringify({
          type: 'neural:connected',
          node: { userId: auth.userId, role: auth.role, displayName: auth.displayName },
          stats: getNeuralNetworkStats(),
          recentSignals: recent
        })
      );
    } catch {
      // Safe fallback
    }

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
          return;
        }
        if (typeof msg?.type === 'string' && msg.type.startsWith('call:')) {
          const allowedCallEvents = new Set([
            'call:invite',
            'call:ringing',
            'call:accept',
            'call:offer',
            'call:answer',
            'call:ice',
            'call:hangup'
          ]);
          if (!allowedCallEvents.has(msg.type)) return;

          const callFrame = JSON.stringify({
            type: msg.type,
            roomId: String(msg.roomId || '').slice(0, 48),
            fromUserId: auth.userId,
            fromName: String(msg.fromName || auth.displayName).slice(0, 80),
            fromRole: auth.role,
            targetUserId: msg.targetUserId ? String(msg.targetUserId).slice(0, 64) : null,
            targetRole: msg.targetRole ? String(msg.targetRole).slice(0, 24) : 'all',
            mode: msg.mode === 'voice' ? 'voice' : 'video',
            payload: msg.payload || null,
            ts: Date.now()
          });

          for (const client of activeClients) {
            if (client.ws.readyState !== WebSocket.OPEN) continue;
            if (client.userId === auth.userId && client.ws === ws) continue;
            const matchesUser = msg.targetUserId && client.userId === msg.targetUserId;
            const matchesRole = !msg.targetRole || msg.targetRole === 'all' || client.role === msg.targetRole || client.role === 'admin';
            if (matchesUser || matchesRole) {
              try {
                client.ws.send(callFrame);
              } catch {
                // ignore closed peer socket
              }
            }
          }
          return;
        }
        if (msg?.type === 'signal' || msg?.eventType) {
          const eventType: NeuralSignalType = msg.eventType || 'signal';
          const content = String(msg.content || msg.message || '').trim();
          if (!content) return;
          dispatchNeuralSignal({
            channel: msg.channel || 'neural_mesh',
            eventType,
            senderId: auth.userId,
            senderName: msg.senderName || auth.displayName,
            senderRole: auth.role,
            targetRole: msg.targetRole || 'all',
            targetUserId: msg.targetUserId || null,
            recipientName: msg.recipientName || null,
            subject: msg.subject,
            content,
            payload: msg.payload,
            priority: msg.priority || 'normal'
          });
        }
      } catch {
        // Ignore malformed client frames
      }
    });

    ws.on('close', () => {
      activeClients.delete(meta);
    });

    ws.on('error', () => {
      activeClients.delete(meta);
    });
  });

  // Seed one initial welcome neural pulse if table is empty
  const cnt = (db.prepare('SELECT COUNT(*) as cnt FROM neural_messages').get() as { cnt: number }).cnt;
  if (cnt === 0) {
    dispatchNeuralSignal({
      channel: 'neural_mesh',
      eventType: 'signal',
      senderId: 'neural-core-server',
      senderName: 'Doctorian Autonomous Neural Core',
      senderRole: 'system',
      targetRole: 'all',
      subject: 'Neural Mesh Synchronized',
      content: 'Multi-role WebSocket neural bus online for Patient, Doctor, Nurse, E-Pharmacy & Admin telemetry.',
      priority: 'normal',
      skipSelfLoop: true
    });
  }

  return wssInstance;
}
